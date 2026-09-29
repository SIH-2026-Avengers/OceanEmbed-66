import os
from pathlib import Path
from typing import Any

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


MODEL_PATH = Path(os.getenv("OCEAN_MODEL_PATH", Path(__file__).with_name("oceanembed_best.keras")))
GRID_HEIGHT = 68
GRID_WIDTH = 80
INPUT_FEATURES = ("analysed_sst", "sos", "sla", "u", "v", "uwnd", "vwnd")
DEFAULT_DEPTHS = (0, 50, 100, 200, 300, 500, 1000)


def get_output_depths() -> tuple[float, ...]:
    configured = os.getenv("OCEAN_MODEL_DEPTHS")
    if not configured:
        return DEFAULT_DEPTHS

    try:
        depths = tuple(float(value) for value in configured.split(","))
    except ValueError as exc:
        raise RuntimeError("OCEAN_MODEL_DEPTHS must be a comma-separated list of seven numbers") from exc

    if len(depths) != 7 or any(not np.isfinite(depth) for depth in depths):
        raise RuntimeError("OCEAN_MODEL_DEPTHS must contain exactly seven finite numbers")
    if tuple(sorted(set(depths))) != depths:
        raise RuntimeError("OCEAN_MODEL_DEPTHS must be strictly increasing")
    return depths


OUTPUT_DEPTHS = get_output_depths()
_model: Any | None = None


class ModelInputs(BaseModel):
    analysed_sst: float = 28.6
    sos: float = 34.8
    sla: float = 0.12
    u: float = 1.2
    v: float = 0.0
    uwnd: float = 6.4
    vwnd: float = 0.0


class PredictionRequest(BaseModel):
    locationKey: str = "arabian_sea"
    latitude: float = 18.5
    longitude: float = 65.2
    date: str | None = None
    inputs: ModelInputs = Field(default_factory=ModelInputs)


def load_model() -> Any:
    global _model
    if _model is not None:
        return _model

    if not MODEL_PATH.is_file():
        raise HTTPException(status_code=503, detail=f"Keras model not found: {MODEL_PATH}")

    try:
        from tensorflow import keras

        loaded_model = keras.models.load_model(MODEL_PATH, compile=False)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Could not load the Keras model: {exc}") from exc

    expected_shape = (None, GRID_HEIGHT, GRID_WIDTH, len(INPUT_FEATURES))
    if tuple(loaded_model.input_shape) != expected_shape:
        raise HTTPException(
            status_code=503,
            detail=f"Expected model input shape {expected_shape}, got {loaded_model.input_shape}",
        )

    output_shape = loaded_model.output_shape
    expected_output = (None, GRID_HEIGHT, GRID_WIDTH, len(OUTPUT_DEPTHS))
    if tuple(output_shape) != expected_output:
        raise HTTPException(
            status_code=503,
            detail=f"Expected model output shape {expected_output}, got {output_shape}",
        )

    _model = loaded_model
    return _model


app = FastAPI(title="OceanEmbed Keras Inference API", version="1.0.0")
cors_origins_env = os.getenv("OCEAN_CORS_ORIGINS", "*")
allow_origins = ["*"] if cors_origins_env == "*" else [o.strip() for o in cors_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$|^https://.*\.onrender\.com$" if "*" not in allow_origins else None,
    allow_credentials=True if "*" not in allow_origins else False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/health")
def health() -> dict[str, Any]:
    return {
        "status": "model_loaded" if _model is not None else "model_file_found" if MODEL_PATH.is_file() else "model_missing",
        "model_file": MODEL_PATH.name,
        "model_loaded": _model is not None,
        "input_shape": [GRID_HEIGHT, GRID_WIDTH, len(INPUT_FEATURES)],
        "input_features": INPUT_FEATURES,
        "output_depths": OUTPUT_DEPTHS,
    }


@app.post("/api/v1/predict")
def predict(request: PredictionRequest) -> dict[str, Any]:
    model = load_model()
    feature_values = request.inputs.model_dump()
    input_grid = np.empty((1, GRID_HEIGHT, GRID_WIDTH, len(INPUT_FEATURES)), dtype=np.float32)

    for channel, feature in enumerate(INPUT_FEATURES):
        input_grid[0, :, :, channel] = feature_values[feature]

    try:
        output = np.asarray(model.predict(input_grid, verbose=0), dtype=np.float32)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Model inference failed: {exc}") from exc

    expected_output = (1, GRID_HEIGHT, GRID_WIDTH, len(OUTPUT_DEPTHS))
    if output.shape != expected_output:
        raise HTTPException(status_code=500, detail=f"Expected prediction shape {expected_output}, got {output.shape}")
    if not np.isfinite(output).all():
        raise HTTPException(status_code=500, detail="Model output contains non-finite values")

    channel_means = output[0].mean(axis=(0, 1))
    return {
        "locationKey": request.locationKey,
        "latitude": request.latitude,
        "longitude": request.longitude,
        "date": request.date,
        "predictions": [
            {"depth": depth, "temperature": float(channel_means[index]), "outputChannel": index}
            for index, depth in enumerate(OUTPUT_DEPTHS)
        ],
        "metrics": None,
        "inputMode": "constant_grid_prototype",
        "inputNotice": "Each supplied feature value was broadcast across the 68x80 grid. Replace with gridded observations for scientific inference.",
        "preprocessingNotice": "No training normalization was applied because the training scaler was not available.",
        "depthMappingNotice": "Output channels are assigned the configured depths; verify this mapping against the model training pipeline.",
        "inputs": feature_values,
    }


frontend_dist = Path(__file__).resolve().parent / "Frontend" / "dist"
if frontend_dist.is_dir():
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse
    from starlette.exceptions import HTTPException as StarletteHTTPException

    @app.exception_handler(StarletteHTTPException)
    async def custom_http_exception_handler(request, exc):
        if exc.status_code == 404 and not request.url.path.startswith("/api/"):
            index_file = frontend_dist / "index.html"
            if index_file.is_file():
                return FileResponse(index_file)
        raise exc

    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)