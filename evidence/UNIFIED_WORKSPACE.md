# Unified Lens verification

The main entry now opens one workspace with Live Camera and Scientific Lab view controls. The existing public audience and server-only Meta key are preserved.

## Implemented behavior

- Video remains playing while a selected camera frame is classified and planned. Recognition does not call video.pause or substitute a held photograph for a live feed.
- The live layer uses Three.js lit meshes, particles, moving trace balls, pivots and glow markers in normalized image coordinates. A local patch tracker updates the registration about 8 times per second while rendering runs on requestAnimationFrame.
- If registration is lost, video continues and the live mesh is hidden until re-aligned or re-scanned. Automatic recognition is bounded to three scans per session, at least 30 seconds apart. Manual capture remains available.
- The classifier supplies hasDiagram. Text-only equations/questions construct a scientific model in the same workspace. Scientific Lab can also be explicitly selected before capture or upload.
- Quadratics support image extraction, editable coefficients, roots, discriminant, a 3D curve and continuously moving mathematical marker. The mathematical marker does not claim a physical mass or gravity trajectory.
- The lab fits edited curves automatically. Display grid spacing is illustrative; exact values come from the equation and metrics.
- Supported reviewed scientific models can be changed through a Meta typed patch. Projectile angle edits, circuit current/switch changes and ideal incline changes can update the registered live overlay approximately. Unsupported mechanics and arbitrary wiring are reported honestly.
- Camera permission errors, cancellation, HTTP/JSON failures, retries and review are visible. Request replay caching is instance-local, scoped by client and route, checks a body hash, and shares pending work. It is not a durable distributed job system.

## Verification performed

- 51 automated tests pass, including independent quadratic checks, image extraction contract, scientific edit validation, physical invariance under mass changes, normalized live paths, and concurrent retry de-duplication.
- Browser: manual quadratic to actual WebGL curve and ball; orbit controls; source and coefficient controls; real Meta "Double a" changes a from 1 to 2 and removes real roots; uploaded circuit to real Meta classification/plan and visible lit 3D overlay.
- The supplied small quadratic screenshot was accepted as a quadratic preview. Its small text was read differently on one live extraction, which is why coefficients stay editable and require review. OCR is not assumed perfect.
- Phone layout checked at 390 × 844 with no horizontal overflow.
- This verification did not exercise a physical camera capture or calibrated spatial AR. Camera geometry remains a 2D similarity estimate. AI coordinates and illustrative page scaling are approximate; large motion requires a new scan.

## Not claimed

Arbitrary image reconstruction, arbitrary physical systems, exact circuit topology for parallel/multiple-source wiring, calibrated 3D world pose, or perfectly accurate image recognition.
