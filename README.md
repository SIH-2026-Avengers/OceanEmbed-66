# OceanSat-66
OceanEmbed - Satellite Embedding-Based Deep Learning Framework for Reconstruction of Subsurface Ocean Temperature from Surface Satellite Observations.

## Setup (once)

Use Python 3.11, 3.12, or 3.13 for TensorFlow. From the repository root on Windows:

```powershell
py -3.13 -m venv .venv313
.venv313\Scripts\Activate.ps1
python -m pip install -r requirements.txt
npm ci --prefix Frontend
```

## Daily startup

From the repository root, activate the Python environment and run the frontend command. It starts the Python API, waits for its health endpoint, then starts Vite on port 3000. Press Ctrl+C to stop both services. Dependencies are installed once above; `package-lock.json` keeps frontend installs reproducible.

```powershell
.venv313\Scripts\Activate.ps1
npm --prefix Frontend run dev
```

The API defaults to `http://127.0.0.1:8000`; set `Frontend/.env` to override it:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Model Interface

`main.py` loads `oceanembed_best.keras` and checks for a `(68, 80, 7)` input and `(68, 80, 7)` output. The seven input channels follow the variable names in the notebook: `analysed_sst`, `sos`, `sla`, `u`, `v`, `uwnd`, and `vwnd`. Until gridded source data is connected, the API broadcasts each UI default across the full grid: SST, SSS, SSH, surface current as `u`, `0` as `v`, wind speed as `uwnd`, and `0` as `vwnd`. Chlorophyll is not an input channel in this model.

The default vector components assume positive `u`/`uwnd` and zero `v`/`vwnd`; edit all seven values in the Overview input panel. The training scaler/normalization is not present in the available notebook, so the prototype sends values as-is. The output layer has seven channels, but the training depth-to-channel mapping is not present either. The current default mapping is an assumption and can be overridden with `OCEAN_MODEL_DEPTHS`, a comma-separated list of seven increasing depths. Confirm both preprocessing and channel order against the training pipeline before using outputs as validated scientific results.

The API averages each output channel spatially for the existing profile chart. It does not calculate RMSE, MAE, R², or confidence without matching reference observations; those values appear as unavailable in Live Model mode. The `/api/v1/health` and `/api/v1/predict` endpoints are available on port 8000.
