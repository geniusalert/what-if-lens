# Scientific compiler upgrade — November 4, 2026

## Preserved earlier work

Quadratic/calculus, ideal projectile and simple DC circuit labs; original notebook, comparisons, prediction prompts, manual entry, import/export; conceptual motion gallery and original warm-light landing page.

## New work in this upgrade

- Three.js WebGL scientific workbench with orbit controls, force arrows, source rail, graphite/cyan/amber design and reduced motion.
- Shared ScientificIR validator with units, provenance, confidence, review gates, bounded models and explicit series topology checks.
- Incline Coulomb-friction solver with force/energy checks; sampled surface AST with finite-difference gradients; multi-resistor series solver; shared frame-state functions.
- Verified inverse goals: rest at incline release, double projectile range, halve circuit current.
- Backend analyze/validate/experiment/modify/inverse/retrieve contracts; Meta typed extraction and patch planning; server-only keys, bounded retries, visible provider evidence, timeouts and process-local request budgets.
- Review/correction UI, approximate source boxes, synchronized baseline ghosts and plots, undo/redo, deterministic seeking, local session restore and JSON exports.
- Recording tool for a user-selected screen/tab, setup instructions, fixture set, architecture notes and measured CPU benchmark.

## Pending external prerequisites

- Owner configures Meta runtime secret and proves real model calls on unfamiliar images.
- Owner records final narrated three-minute demo and submits it through the competition platform.
- This release does not implement arbitrary topology/nodal analysis, general symbolic proofs, SAM segmentation, voice transcription, calibrated AR registration or universal diagram reconstruction.
- Backend experiment IDs/history live in bounded process memory for at most two hours; exports/browser snapshots are the persistence mechanism. Worker restarts or another instance can require experiment recreation. No shared cloud experiment database or cross-device syncing is claimed.

The Git history and this file distinguish the prior MVP from the new scientific compiler work. They do not certify hackathon eligibility or the official event dates.


## Camera lens increment

Added real getUserMedia preview, front/rear switching, snapshot capture, tap-to-focus model requests, live Canvas motion overlays, freeze/resume and bounded opt-in auto-scan. Added local similarity tracking with an explicit lost-alignment state and camera-stream cleanup. Camera frames can enter the existing scientific review/solver path. The model key remains a pending owner setup dependency; no real-world AR registration or general-object animation capability is claimed.

## Camera planning reliability

Reproduced a 40-second Meta animation timeout using the reported screenshot. Planning now requests compact geometry, permits 60 seconds per attempt, and retries one transient, truncated, or invalid response. Authentication and quota errors are distinguished and not retried. Camera retries preserve the held frame and classification; stale result details are cleared. A blocked video resume keeps the valid animation on the held frame.

Live verification on the reported screenshot: Meta classified circuit in 15.6 seconds and returned a validated plan with 2 tracks and 3 markers in 23.0 seconds. Hardware camera capture was not exercised by the agent. All 41 automated tests pass, including 5 provider-failure regression tests.

## Captured image recovery and camera permissions

Camera Mode now renders the actual captured image in a separate image element, keeps it held after inference, and makes live tracking an explicit option. Loss of alignment or stalled playback returns to that original image with its animation and identity transform. Photo upload stays inside Camera Mode, resizes before sending, and works with no camera permission. Permission errors include browser/Windows recovery instructions and a copyable direct link. Reticle corners no longer inherit the global dot styling.

Client API calls validate returned plans, support cancellation and bounded deadlines, preserve provider errors and request references, handle non-JSON gateway failures, and never silently replay chargeable POST requests. Server-side bounded retry remains in effect. All 44 automated tests pass. Browser QA used an owned fixture, a real Meta classification and plan, visible captured-image animation, and no console errors. Physical device capture remains unverified by the agent.
