import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(frontendDirectory, '..');
const pythonExecutable = process.platform === 'win32'
  ? path.join(projectDirectory, '.venv313', 'Scripts', 'python.exe')
  : path.join(projectDirectory, '.venv313', 'bin', 'python');
const viteEntry = path.join(frontendDirectory, 'node_modules', 'vite', 'bin', 'vite.js');
const apiUrl = 'http://127.0.0.1:8000/api/v1/health';
const apiTimeoutMs = 60_000;
const childProcesses = [];
let stopping = false;

if (!existsSync(pythonExecutable)) {
  console.error(`Python environment not found at ${pythonExecutable}. Create it and install requirements.txt first.`);
  process.exit(1);
}

if (!existsSync(viteEntry)) {
  console.error('Frontend dependencies are missing. Run "npm ci --prefix Frontend" first.');
  process.exit(1);
}

function stopServices(exitCode = 0) {
  process.exitCode = exitCode;
  if (stopping) return;
  stopping = true;
  for (const child of childProcesses) {
    if (child.exitCode === null) child.kill();
  }
}

function startService(name, executable, args, cwd) {
  const child = spawn(executable, args, { cwd, stdio: 'inherit' });
  childProcesses.push(child);
  child.on('error', (error) => {
    console.error(`${name} failed to start: ${error.message}`);
    stopServices(1);
  });
  child.on('exit', (code) => {
    if (!stopping) {
      console.error(`${name} stopped${code === null ? '' : ` with exit code ${code}`}.`);
      stopServices(code || 1);
    }
  });
  return child;
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForApi(apiProcess) {
  const deadline = Date.now() + apiTimeoutMs;
  let lastError = 'no response';

  while (Date.now() < deadline) {
    if (apiProcess.exitCode !== null) {
      throw new Error('The Python API stopped before becoming ready.');
    }

    try {
      const response = await fetch(apiUrl);
      if (response.ok) return;
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    await delay(500);
  }

  throw new Error(`The Python API did not become ready within ${apiTimeoutMs / 1000} seconds (${lastError}).`);
}

process.on('SIGINT', () => stopServices(0));
process.on('SIGTERM', () => stopServices(0));

try {
  const apiProcess = startService(
    'Python API',
    pythonExecutable,
    ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000'],
    projectDirectory
  );

  await waitForApi(apiProcess);
  console.log('Python API is ready on http://127.0.0.1:8000.');

  startService(
    'Vite',
    process.execPath,
    [viteEntry, '--host', '127.0.0.1', '--port', '3000', '--strictPort'],
    frontendDirectory
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  stopServices(1);
}