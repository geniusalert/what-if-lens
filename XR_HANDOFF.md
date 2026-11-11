# What-If Lens XR — implementation and submission status

## Verified competition constraints (11 November 2026)
Source: https://start-developer-competition-26.devpost.com/rules
FAQ: https://start-developer-competition-26.devpost.com/details/faqs

- Submission representative needs Start membership and Developer Access; age, residence, conflicts and funding restrictions also apply. Membership has not been verified.
- Deadline: November 18, 2026, noon PST (November 19, 1:30 AM India time).
- Productivity is the proposed track. Division depends on project inception and prior-code history; do not assert eligibility without reviewing it.
- Hands-first operation must work end to end. Controller-only operation is insufficient.
- Provide judge access, source/project link and a public YouTube/Vimeo demo under three minutes with Quest or accepted emulator footage. Keep access free through judging.
- Demo footage must represent actual gameplay. Submission is not performed by this coding change.

## Implemented first increment

`/#xr`: native Three.js/WebXR immersive mode; headset session entry, hand models, select rays, model grabbing, spatial chapter buttons, pause/reset/resize, custom in-world keyboard, deterministic scientific parameter changes. Desktop pointer preview is available.

`/?emulate=1#xr`: opt-in IWER 2.8.0 hand-input runtime and developer UI. Emulator dependencies are a separate bundle and do not initialize in normal mode.

Four authored chapters run without AI: projectile, incline, circuit and quadratic. Image upload prepares an illustrative generated model before entering VR; it is not Quest passthrough scanning. Typed editing of generated models uses the existing server API; exact authored experiments use validated local parameter changes.

## Explicit remaining acceptance gates

- IWSDK is NOT integrated yet. Current code uses native WebXR. The official SDK currently requires a different shared Three runtime; isolate/migrate deliberately instead of introducing two incompatible Three versions into the existing renderer.
- Run actual IWER immersive session and record evidence of every hands-only path, including keyboard, selection, grabs, release and exit. Desktop preview alone is not proof.
- Verify hand-ray/select behavior on target runtime; add near-pinch interactions and ergonomic refinements after testing.
- Actual diagram illustrations/book pages need further visual work; initial spatial chapters are selectable panels.
- Profile Quest performance; no hardware FPS claim is made. Confirm session cleanup, visibility pause, reference spaces and FOV.
- Numerical model scope remains the existing solver scope. General AI scene edits remain illustrative.
- Verify eligibility with entrant, choose division honestly, record demo, complete Devpost manually.

## Demo target (under 3 minutes)

0:00–0:20: seated onboarding and hands-only chapter choice.
0:20–1:00: select projectile, manipulate spatial experiment, pause and inspect.
1:00–1:45: change launch angle, replay and explain deterministic trajectory.
1:45–2:15: choose circuit, change voltage, demonstrate immediate response without AI.
2:15–2:45: custom prompt keyboard, reset and exit; state scanning/AI limitations honestly.

## Development

npm install
node build.mjs --vercel
npm run dev

Open http://localhost:4173/#xr or the emulator query route above. Production requires HTTPS and xr-spatial-tracking permission. Existing 77 tests and frontend build pass; they do not substitute for the outstanding immersive acceptance test.
