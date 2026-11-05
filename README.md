# What-If Lens

The main **Open Lens** entry combines a continuously live camera and a 3D Scientific Lab in one workspace. Use the top switch: diagrams can animate over the camera, while equations and text-only questions construct a model in the lab. Quadratic equations are supported. The same prompt edits the active experiment.

See [evidence/UNIFIED_WORKSPACE.md](evidence/UNIFIED_WORKSPACE.md) for the current verification and limits.

From static learning material to executable scientific experiments.

A Meta-first scientific compiler with a Three.js workbench, deterministic solvers, source review and verified inverse experiments. The earlier math/physics labs and conceptual motion studio remain available.

## Quick start

Requires Node.js 22 or newer.

```
npm install
npm run build
npm run dev
```

Open http://localhost:4173. Choose Scientific Lab. Manual samples work without keys. See [SETUP.md](SETUP.md) to configure server-only Meta credentials. `npm test` runs all acceptance tests; `node scripts/benchmark.mjs` records local CPU timings.

## Supported scientific models

| Model | Engine | Scope |
|---|---|---|
| Incline | Analytic Coulomb friction, release from rest | Static threshold, sliding acceleration, forces and energy residual |
| Surface | Bounded AST evaluator, 49×49 samples | sin, cos, exp, sqrt, abs, arithmetic, literal powers up to 8; numerical gradients |
| DC circuit | Validated ordered series network | One source, 1–8 linear resistors, ideal switch, voltage/power checks |
| Projectile | Analytic ballistic model | Constant g, level ground, no drag |
| Earlier quadratic lab | Analytic polynomial methods | Roots, derivative, vertex, signed integral and total area |

## Architecture

```
Photo/manual input
  → Meta scientific extraction (server)
  → ScientificIR / source provenance / review gate
  → Unit, range, topology and expression validation
  → Deterministic solver and frameState(t)
  → Three.js scene + plots + original-image overlay

Instruction → Meta typed patch → validator → solver → history/compare
Outcome goal → analytic inverse → forward verification → target/error
```

The GPU renderer consumes solver results and does not invent authoritative physics. Playback speed changes time, not gravity or physical coefficients. Incline and projectile frames use closed-form trajectories; a 1/120-second step advances the same deterministic function. No ODE tick is needed for these analytic models. Geometry transitions are visual; paused seek renders exact target geometry. Surface extrema are sampled; gradients are finite differences with h=0.0001, not symbolic proofs.

The browser bundles no provider credentials. AI endpoints use protected MODEL_API_KEY and optionally an explicitly enabled OpenRouter fallback. Visible traces show provider, model, request ID, attempt status, timing and validation. Authored samples are marked with no AI inference. Do not use a configured status alone as evidence of a successful API request.

## API

- POST `/api/analyze`: image → Meta candidate IR and uncertainty.
- POST `/api/validate`: reviewed candidate → validated IR or actionable error.
- POST `/api/experiments`: reviewed IR → ID, calculated run, metrics.
- GET `/api/experiments/:id`: same-owner in-memory snapshot.
- POST `/api/experiments/:id/modify`: natural-language instruction → Meta typed patch → re-solved run.
- POST `/api/experiments/:id/inverse`: allowed goal → analytic proposal and forward-verification evidence.
- Earlier `/api/solve`, `/api/status`, `/api/classify`, `/api/animate` remain for compatibility and the conceptual gallery.

Public experiments use a per-browser random owner token in X-Experiment-Owner. The platform supplies authenticated identity on private Sites. Server records are bounded, ephemeral, instance-local and expire after two hours; browser snapshots and exported JSON provide persistence. A restart or another instance can require recreation from the browser state. There is no shared cloud database.

## Reliability and limits

Model outputs are data only: safe AST and whitelisted patches, no eval or generated scripts. Review rejects inferred values until explicitly confirmed. Topology validation rejects ambiguous/non-series wiring. Uploads are limited and re-encoded locally. No photos are persisted by this application server; the selected AI provider processes the uploaded image. Browser snapshots retain source transcription and parameters, not the original image.

AI calls have timeouts, a bounded transient retry, and best-effort per-instance request budgets. These do not replace provider billing caps. The app reduces pixel ratio when observed FPS drops. Browser FPS is an observation, not a claim about other hardware.

Read [RELEASE_NOTES.md](RELEASE_NOTES.md) for implemented vs pending work and [DEMO.md](DEMO.md) for the three-minute recording plan. Record demo uses a user-selected tab/screen and downloads locally; it does not fabricate video or automatically submit anything.

## Evidence

- `tests/`: regressions, independent analytic references, AST rejection tests, inverse forward checks and mocked provider integration.
- `evidence/benchmark.json`: actual local CPU measurements, excluding model latency and GPU time.
- `fixtures/`: independently authored inputs and expected extraction targets. Classification on these has **not** been measured against a live Meta account without a key.
- `evidence/`: screenshots/test report when present. Model mocks are explicitly not live inference evidence.

## Deployment

`npm run build` bundles the Three.js client and Worker ESM server to dist/. Sites deployment uses `.openai/hosting.json` for the existing Site identity. Keep runtime secrets out of that manifest and Git. Client assets are served from the same origin. The public demo should retain manual guest access; AI availability depends on the server secret and quota.

No guarantee of hackathon eligibility, acceptance or judging outcome is implied. Final live Meta validation and narrated recording require the owner's configured account.


## Live camera lens

Choose Open camera on the landing page, or Live camera in the scientific workbench. Enable the camera using the browser permission dialog, point at a supported science diagram, and tap the diagram or Bring to life. The app captures a frame, calls the Meta-primary classifier and motion planner, then draws a conceptual animation over the video. Tap location is passed as a bounded normalized point so the model can focus on that diagram. Meta credentials remain server-side.

The rear camera is preferred, with front/rear switching, freeze/resume, playback speed, reduced motion, and a photo fallback. Optional auto-scan is off by default; it waits for a steady view and is capped at three scans per camera session with at least 30 seconds between attempts. Only selected snapshots are uploaded, not a continuous video/audio stream. No audio is requested. Returning from the lens or closing the page releases all camera tracks, including permission grants that arrive after closing.

A local patch tracker estimates small 2D translation, scale and rotation between frames. This is approximate image alignment, not calibrated spatial AR. Camera movements, occlusion, repetitive texture, blur or perspective change may break alignment; the overlay hides and asks for a new scan. Sparse/untextured input may remain a held frame. A frame with no localized motion plan does not receive an unrelated sample animation. It can be opened in the scientific lab for reviewed extraction.

Use HTTPS and a browser that permits camera access. If the embedded app view blocks camera permission, open the public URL directly in Safari or Chrome. Physical-device capture and successful camera-to-Meta interpretation need the owner's camera permission and a configured account key; synthetic tracking/lifecycle tests do not certify that live path.
