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

- IWSDK runtime integration is now implemented (see fourth increment). Actual immersive acceptance testing remains pending.
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


## Second implementation increment

- Illustrated selectable textbook diagrams on a physical book backing.
- Validated local prompt grammar, unit checks, halve/double/set/increment operations and circuit switch commands. Unsupported wording cannot silently alter a parameter.
- Undo history, live numerical feedback, bounded resizing and corrected camera/floor placement.
- Near-hand pinch selection/grabbing with joint-distance hysteresis; controller rays remain a secondary input.
- Grabs are released on chapter change, reset/recenter, session end and exit. Single-owner grabbing prevents two inputs fighting over the model.
- Entry link now opens XR from the existing homepage; repeated entry replaces the old session.
- 82 tests pass and production bundles compile. Browser verification was attempted but blocked by Work settings (local browser use disabled). Actual IWER/hardware hands-only acceptance and IWSDK migration remain pending, not claimed complete.
- Entrant supplied a Start application submission confirmation. Approval remains pending.


## Third increment: learning loop and notebook

- Four scientifically scored challenges with controlled-variable checks. Challenges and authored experiments run without AI.
- Before/after numerical comparison with physical units, including restored baseline after undo.
- Validated local notebook retaining twelve experiments and completed-chapter badges. Storage failure is reported. Resume reconstructs the saved model, not merely its title.
- Desktop-accessible actions mirror spatial challenge/check/compare/save/resume controls.
- Negative-number keyboard key for quadratic edits.
- XR session visibility pauses animation and releases grabs. Exit ends the immersive session before destroying its renderer.
- Build and 86 tests pass. Browser/immersive verification is still pending because browser automation was disabled in Work settings at the last attempt. IWSDK integration and hardware performance remain outstanding.


## Fourth increment: documented input and SDK gaps

Requirement sources reviewed: the pasted XR implementation brief, the existing XR handoff, and the older Phase 2 developer PDF from Downloads. The standalone newer XR PDF/Word file was not found locally; its exact path has been requested.

| Requirement | Current implementation | Verification / limitation |
|---|---|---|
| Meta IWSDK | Pinned 1.1.0-rc.2 World owns scene, camera, renderer, XR entry and ECS update loop | Compiles; immersive/browser execution blocked by Work settings |
| One Three runtime | App, IWSDK and IWER use the exact super-three 0.185.0 dependency | npm dependency tree verified; existing renderer tests pass |
| Create from text | Type Create/Build/Construct followed by an experiment description | Bounded server schema, Meta provider, same safety validator; illustrative geometry |
| Image to scientific model | Image mode defaults to scientific extraction, shows quantities and provenance; confirm/correct before scoring/saving | Existing deterministic solver scope only; inferred data is not a measurement |
| Image to general 3D | Explicit illustrative image mode retained; source image shown on a spatial panel | General geometry is not a numerical simulation |
| Runtime loading | XR SDK and emulator have separate browser bundles | SDK bundle size still needs profiling/optimization; normal camera entry does not load SDK |
| Simulator ownership | Existing animation updates run inside an IWSDK ECS system; no duplicate draw loop | Unit test covers render ownership |
| Hands-only complete flow | Existing spatial controls, keyboard and hand selection retained | Hardware/emulator walkthrough, upload inside XR and voice accessibility still unverified/incomplete |
| Submission material | Existing storyboard and eligibility checklist | Approval, actual footage, hardware performance and Devpost submission still pending |

SDK physics/Havok and locomotion are deliberately disabled in this seated version. Authored chapters use validated deterministic scientific solvers. The integration does not claim a general rigid-body sandbox, room anchors, calibrated passthrough scanning or arbitrary exact physics.

90 tests pass; frontend build succeeds. This is implementation evidence, not a claim that headset acceptance checks have passed.

Live Meta text-to-scene check: generated a four-object pendulum scene in 39.3 seconds with a validated successful response. Generation is provider-dependent, not instant. Verified target commands now include double the range, make it stop sliding (a new-release static-friction solution), and halve the current, with target/actual/error feedback.


## Fifth increment: playback, voice and portable experiments

- XR playback now provides 0.25×, 0.5×, 1× and 2× speeds, seek and 1/60-second frame stepping; stepping/seek pause the experiment. Spatial controls and desktop controls both affect the same timeline.
- Scientific models AND generated illustrative scenes can be saved/resumed locally, exported as bounded JSON, and imported after validation. Unconfirmed scientific models cannot be exported as confirmed experiments. Credentials and source images are not part of the snapshot envelope.
- Manual quadratic equations compile locally into an exact model without Meta latency. Spatial keyboard supports the needed symbols and has a close control.
- Optional browser SpeechRecognition sends one recognized command through the existing prompt path, with text fallback and stale-command cancellation. It is not Meta Voice transcription and headset microphone behavior is not verified.
- Cancel-processing controls retain the current model. Reduced-motion users start with playback paused.
- Desktop framing, readable spatial labels and a collapsible console replace the distant preview and inherited header layout. Background page is inert while the XR dialog is open.
- Multi-entry shared-module builds remove independently bundled Three copies; SDK and emulator remain lazy entries. Local server and deployment asset lists serve emitted shared chunks.
- Browser verification: constructed `y = x^2 - 4x + 3`, selected 0.5× speed, stepped a frame, saved, changed the equation and resumed the saved experiment paused at the saved speed/time. No browser errors or warnings were reported. Export reached its success status, but the browser download event timed out, so file delivery/import and immersive acceptance remain unverified. Fixed unnecessary repeated DOM writes for paused transport state and restored background interaction after failed initialization. Screenshot: `reference/xr-playback-notebook.png`.
- 95 automated tests pass, including snapshot validation, playback behavior, generated-scene persistence and manual equations. Physical headset interaction, voice capture, full hands-only emulator walkthrough and demo recording remain acceptance gates.


## Sixth increment: camera-first spatial workflow

The XR workspace now starts without an unexplained experiment. Camera start/flip/stop, explicit frame extraction and source uploads share the image-to-model path. The previous model is cleared at extraction start. A live video background can show desktop camera surroundings; generated objects are manually placed, not calibrated against physical geometry. Captures are bounded to 1000px and no audio/continuous video is sent to the model. Late camera permission results release tracks after stop/close. Extraction has cancellation and a 120-second client limit.

IWSDK now initializes an alpha-capable renderer and offers separately detected immersive-vr and immersive-ar entry. Passthrough sessions clear transparently and hide the virtual floor/walls. A simple virtual lab supplies VR/desktop context. Quest passthrough pixels are not assumed available to AI; prepare/upload a source when getUserMedia is unavailable. Calibrated registration, depth occlusion, native headset camera integration and automatic room extraction are NOT complete.

Visible startup feedback replaces a blank asynchronous entry. Provider failures distinguish authentication, quota, timeout and invalid geometry. Camera lifecycle and credential-error tests bring the suite to 99 passing tests. Build passes. Browser entry/capture upload/status handling inspected without console warnings. First illustrative UI extraction failed; a follow-up real Meta API call on projectile-24.png succeeded with 4 validated objects after one repair (73.2 seconds). Physical camera capture and actual immersive sessions remain unverified; this is not complete headset acceptance.

Context and plan: XR_CAMERA_CONTEXT.md. Production remains what-if-lens.vercel.app; the historical chatgpt.site address is not this deployment.


## Seventh increment: compact, image-led interface

Removed the sample textbook, default chapters, preset variable wall and duplicated source-image plane from the camera workspace. Nothing is created on entry. Camera/upload/capture sit in one bottom bar; playback, source thumbnail, saved experiments, interpretation and headset entry move into a dismissible Controls drawer. Desktop camera view contains no spatial UI panels or artificial room. Immersive mode retains a single Controls button that expands a small tray on demand. Model grab interaction remains available.

The full camera is the context; only the current extracted model is presented. Captured sources remain inspectable inside the drawer rather than competing with the model. Camera-ready state dismisses onboarding. Busy captures disable capture/upload actions. Portrait framing scales models to fit, and resizing recenters the model.

Verified the actual browser at desktop and 390×844: drawer open/close and local equation rendering work without console errors; sample cards and floating control wall are absent. Checked and corrected portrait model clipping. No new provider generation or physical headset acceptance is claimed in this UI increment. 99 automated tests pass and production build succeeds.


## Eighth increment: MR-first structure and intentional interaction

See VR_FIRST_PLAN.md for the point-by-point request, implementation and acceptance record. The website now has two destinations: spatial MR/VR (default) and Scientific Lab (explicit). Landing content is about everyday objects and spatial interaction, without mathematics-first calls to action. Legacy camera links route into XR.

Removed the spatial control tray. A model-adjacent AI star opens speak/type input; settings remain disclosed on demand. Models initialize paused and AI edits preserve placement and stay paused. Shared XR rendering no longer reframes the head camera on geometry rebuild. Pinch move, two-pinch resize/rotate and movable-part pull are implemented with touch/controller equivalents. Generated mechanism pulling is illustrative timeline scrubbing, not arbitrary exact rigid-body physics. Actual browser pointer pulling verified connected motion and stable release.

Mixed reality is the default session selection. Home entry requests a session directly from the click; browser/device permission is still required. Optional WebXR raw-camera capture is implemented for devices exposing camera pixels; the path is unverified on hardware. Passthrough alone does not imply raw camera availability. Ordinary phone RGB finger recognition is not implemented. Headset hand tracking and microphone capture still need hardware checks.

103 automated tests pass and Vercel build succeeds. Desktop/mobile visual checks and routes passed without console errors. This is code/browser evidence, not complete hardware acceptance.


## Ninth increment: phone finger tracking and calibrated pinch

User confirmed the failing path is the phone camera preview. Previously this path had no camera finger detector; WebXR-only hand joints could never drive it. Added pinned MediaPipe Tasks Vision 1.2.3 and a versioned local Hand Landmarker model, self-hosted with its WASM runtime. Continuous hand frames stay on the device. No provider calls are made for hand tracking.

When Photo camera is live, the detector updates up to about 15 times/second. A visible cursor and tracking badge indicate hand detection, pinch and two-pinch interaction. Image landmarks map to the model plane, enabling preview move/pull/resize/rotate; this is not real-world depth registration. Capture an object, keep the video feed live, show the whole hand, align the cursor with the model and pinch. Camera aspect ratio is accounted for. Calibration samples open-hand then closed pinch, uses hand-size-normalized distances and hysteresis, and rejects missing/stale tracking. Opening the assistant suspends object manipulation.

Also improved XR: read authoritative XRFrame joint poses in the SDK rig coordinate system, preserve SDK-owned hand/controller parenting, honor native hand select events, add distance point-and-pinch rather than requiring physical reach, and release grabs on tracking loss. Near interactions and UI pinch consumption remain supported.

Verification: unit tests cover frame-origin transforms, missing poses, calibration validity, normalized ratios, far pinch, tracking-loss release, UI consumption, controller ownership and camera coordinates. Actual browser detector initialized and detected 2 hands in Google's official right_hands.jpg fixture through a canvas-to-video capture stream. This proves real local inference, not a live phone-camera hardware walkthrough. Library emits informational native runtime warnings (including the XNNPACK CPU delegate message via console.error); the fixture detection succeeded. Physical phone performance and headset hand tracking still require user-device validation.

References: https://developers.meta.com/vr/documentation/web/webxr-hands/ and https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker?tab=Web . Model provenance and SHA256: src/handtracking/MODEL_SOURCE.md.
