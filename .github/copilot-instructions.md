# Copilot / AI-Agent Instructions for this repository

Purpose
- Help AI coding agents become productive quickly by describing where to look, what conventions to follow, and which automation to run.

Quick agent checklist
- Locate the project root files: look for `README.md`, `package.json`, `pyproject.toml`, `requirements.txt`, `pom.xml`, `docker-compose.yml`.
- Identify source directories: common names are `src/`, `app/`, `services/`, `backend/`, `frontend/`, `web/`, `mobile/`.
- Find test manifests: `jest.config.*`, `pytest.ini`, `tox.ini`, or a `tests/` directory.

How to discover the architecture (practical steps)
- Open the top-level README if present; otherwise search for service manifests (`docker-compose.yml`, `k8s/`, `services/`) to identify components.
- Inspect each top-level folder: read the entrypoint files (`index.js`, `main.py`, `server.ts`, `app.js`) to determine runtime and APIs.
- If multiple service folders exist, treat each as a bounded service: read their `package.json`/`pyproject.toml` to learn build/test commands.

Project-specific conventions & patterns to detect
- Naming: expect services to be named with folders like `api-`, `svc-`, or `gateway` — use those to infer boundaries.
- Config files: prefer `.env` or `config/*.yml`. If present, use them to find runtime dependencies and ports.
- Tests: unit tests are colocated in `__tests__/` or `tests/`; integration tests often live in `integration/` or `e2e/`.

Build / test / debug workflows (how agent should find commands)
- Look for `scripts` in `package.json` to run `npm run build|test|start`.
- For Python, check `pyproject.toml`, `setup.cfg`, or `requirements.txt` and prefer `pytest` if `tests/` exists.
- If `docker-compose.yml` exists, prefer `docker-compose up --build` for reproducing multi-service flows.
- If CI manifests exist (`.github/workflows/`), read them — they often contain canonical build/test commands.

Integration points & external dependencies
- Search for `connection strings`, `AWS`, `GCP`, `AZURE`, `redis`, `postgres`, `mysql` in config files to find external integrations.
- If SDKs (aws-sdk, google-cloud-*, azure-*) appear in dependency manifests, assume cloud resource usage and avoid making destructive changes without tests.

Merging guidance (if this file already exists)
- Preserve any test commands and documented, non-generic run steps.
- Only replace sections that are stale; add a short changelog line at the top describing edits.

Examples (how to reference code while editing)
- When changing an API handler, open the file that exports the route (e.g. `src/api/routes.js` or `services/orders/src/main.py`) and update associated tests under `tests/`.
- If adding a new service, create a `README.md` in the service folder and add `scripts` to its manifest for `build`, `test`, and `start`.

When you are unsure
- Run a quick repo scan: list top-level files and the first-level folder names, then propose a short plan before making edits.
- If no build/test instructions are discoverable, ask the human for the project language/runtime and preferred commands.

Ask for clarification
- Please provide any missing README, CI, or manifest files, or tell me the primary language/runtime. I will iterate this instructions file to include concrete commands and examples.

-- End of file
