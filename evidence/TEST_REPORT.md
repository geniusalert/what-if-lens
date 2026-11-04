# Verification report — November 4, 2026

## Automated

27 tests passed, 0 failed. Full TAP output: `tests.tap`.

The earlier 14 checks were retained. New checks cover incline force balance and energy residual, static-friction threshold, forward-verified inverse solve, series topology and voltage conservation, expression AST rejection, independent surface samples and numeric gradients, provenance/review gates, deterministic seeking, owner-bound API retrieval, experimental history and mocked extraction/patch integration.

The bundled Worker was checked for successful `/`, `/style.css`, `/app.js`, `/lab3d.bundle.js`, and `/api/status` responses. Server and browser bundles built successfully.

## Browser observations

- Three.js incline scene rendered with orbit controls and computed metrics.
- Static-friction inverse changed acceleration from approximately 3.206 m/s² to zero on a fresh release; the UI displayed target, actual and zero absolute error.
- Baseline/current comparison showed the calculated changes and synchronized physical timestamps.
- Surface mesh and cross-section rendered; x-frequency edit recalculated the surface and inspector value.
- Phone-size viewport (390×844) retained the model, timeline, numerical metrics and sequential panels.
- Observed frame counter near 60 FPS in the local test browser. This is not a benchmark for other devices.
- Browser console had no errors during these checks.

CPU measurements in `benchmark.json` exclude network/model latency and GPU frame time. They report actual local runs, not product-wide performance guarantees.

## Not yet verified

- Successful live Meta extraction or free-form editing: owner has not configured a server key. Provider integration tests are mocked and are not live-inference evidence.
- Classifier accuracy on the eight authored fixtures or unfamiliar photographs: not measured.
- Final narrated three-minute recording: requires the configured account and owner-selected screen/audio capture.
- SAM and Meta voice transcription: not implemented.
- General nodal circuits, arbitrary diagram reconstruction or unvalidated physics domains: not supported.

The included screenshots show authored/manual experiments and must not be presented as model-extraction evidence.
