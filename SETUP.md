# Connect Meta on the server

The public app and local samples work without credentials. Photo extraction and free-form AI edits require a valid Meta Model API key with access to `muse-spark-1.3`.

## Local setup on Windows

1. Open PowerShell and run `cd "C:\Users\govin\OneDrive\Documents\ChatGPT\what if lens\what-if-lens"`.
2. Run `powershell -ExecutionPolicy Bypass -File .\setup-local.ps1` and enter the key at the hidden prompt. This writes an ignored `.env` file locally. Do not paste the key into chat or commit the file.
3. Run `npm install`, `npm run build`, then `npm run dev`. Use `npm install`, not `npm ci`; this project does not ship a package-lock file.
4. Open http://localhost:4173 and enter Scientific Lab. Upload a supported photo. Inspect the parsed values, confirm the assumptions, and run the experiment.

The setup script creates or replaces the local `.env` file. It does not configure hosted secrets.

## Hosted Sites setup

The Site owner must configure `MODEL_API_KEY` as a protected runtime secret using Sites environment-variable management, then deploy a saved version to apply the environment revision. The key must never be added to `.openai/hosting.json`, client code, source control, or a public issue.

If using Codex to configure the hosted secret: first run the local hidden-prompt setup above, then ask Codex to transfer the key from the ignored `.env` to the existing Site's protected runtime secret. Codex should pass the value directly to the native Sites environment-variable tool without displaying it, then redeploy the current saved version. The public Site ID is in `.openai/hosting.json`; keep that identity unchanged.

Set optional `META_MODEL=muse-spark-1.3`. Leave `OPENROUTER_API_KEY` unset for a Meta-only demo. If intentionally enabling fallback, configure that key as a runtime secret and set `ALLOW_OPENROUTER_FALLBACK=true`; the UI trace names OpenRouter whenever it is used. Fallback is not evidence of Meta usage.

`AI_REQUESTS_PER_HOUR` defaults to 12 per observed client identity/IP per Worker instance. These are best-effort process-local limits, not a distributed billing cap. Set the provider account's spending limits before a large public event.

## Prove the live path

1. Choose a new diagram from `fixtures/` or photograph your own supported problem.
2. Show the source, extracted quantities, inferred defaults and review gate.
3. Open Execution evidence: a genuine call has provider, model, request ID, attempt statuses and measured duration. A sample has `provider: none`.
4. Change a parameter through an unscripted sentence to exercise Meta's typed patch planning.
5. Run an inverse goal, compare, undo, and export the experiment.

No live Meta request has been certified in the delivered evidence without your key. Automated model tests use mocked HTTP responses and are labeled accordingly.


## Camera use

After configuring the hosted Meta key, open the public URL on your phone in Safari or Chrome. Choose Open camera, then Enable camera and allow camera permission. Point at a clear supported diagram and tap it. Use Flip camera if the wrong lens is selected. The captured frame is analyzed and its conceptual motion overlay is shown on the camera view. Small motions are tracked approximately; re-scan when alignment is lost. Closing the camera view turns off the stream.

Automatic scan is optional and sends selected steady frames to the configured model. Leave it off for tap-only capture. For exact calculations rather than an illustrative overlay, choose Open captured frame in scientific lab and review the extracted quantities before execution.

### If camera access is blocked or tracking is lost

Open the public camera URL directly in Chrome, Edge, or Safari. Allow Camera in the controls beside the address bar. On Windows, Settings → Privacy & security → Camera must also allow desktop apps. An embedded browser may deny camera access even when the server API works. Use **Use a photo instead** to animate in the same camera studio without a camera permission.

After a scan, animation stays on the actual captured image. **Try live camera** enables approximate tracking; if it loses alignment, the original captured image automatically returns. Provider errors now show a request reference; successful request details can be expanded below the explanation.
