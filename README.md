# What-If Lens

A working, dependency-free math and physics web application inspired by the supplied product specification and textbook video.

## Run

Requires Node.js 20 or newer. No package install is needed.

```
npm run dev
```

Open http://localhost:4173. Run `npm test` for analytic acceptance checks, and `npm run build` to create a portable Worker ESM deployment in `dist/`.

## Implemented

- Ideal series DC circuit: voltage, equivalent resistance, switch, calculated current and power, animated conventional current.
- Quadratic/linear functions: hardened polynomial grammar, roots, vertex, analytic derivative, tangent selection, integral, total geometric area, increasing region.
- Ideal projectile: launch speed/angle/gravity, trajectory, flight time, range, height, playback and scrubber.
- Local typed what-if grammar, prediction feedback, worked derivations, parameter correction, undo/redo, baseline comparison, local notebook, JSON import/export, refresh persistence, responsive layout and keyboard controls.
- Image capture/upload with explicitly labeled manual fallback, plus a server-side Meta vision adapter with review and correction before simulation.
- Server endpoints: GET /api/status, POST /api/solve, POST /api/analyze.

## Connect real image understanding

Set MODEL_API_KEY in the server environment (or as a Sites runtime secret) and restart/redeploy. Never put an API key into client files or Git. The adapter calls Meta's documented https://api.meta.ai/v1/chat/completions endpoint with muse-spark-1.3, image content and a constrained scientific extraction schema. Model access, account quota, and a real key are required. Without the secret, the app says vision is disconnected and offers manual entry. Live inference has not been verified without a key.

Meta documentation: https://dev.meta.ai/docs/image-understanding and https://dev.meta.ai/docs/structured-output.

Images are sent to Meta only after the user chooses the analysis action. Source images stay in memory locally and are not stored in the notebook. Confirmed source text, numeric parameters, assumptions and corrections are retained in browser storage and JSON exports. No account database or cloud synchronization is implemented.

## Scientific boundaries

The circuit has one ideal voltage source and one equivalent linear resistive load, with no arbitrary topology or nonlinear lamp model. Brightness and current dots are illustrative; the electrical values are calculated. Quadratics use analytic JavaScript formulas, not a general CAS; irrational roots and thirds render as rounded decimals. Graph viewport is fixed at x = [-4,8], y = [-12,20], so extreme parameter values may leave the view. Projectile motion assumes equal launch/landing elevations, no drag, constant g. Calculus responds to graph selection and controls rather than time, so time playback is hidden in the math lab. Current flow transport pauses/resumes flow; projectile transport scrubs physical time.

Other subjects, free-form AI tutoring, SAM segmentation, voice, PDF region capture, generalized symbolic math, and photorealistic 3D are not implemented. The app's capability view discloses this scope. This is a functional MVP, not the universal long-term platform.

The server proxy is intended for the owner-private deployment. Before any public rollout add authentication, rate limiting and usage quotas to the image inference endpoint.
