# Camera-to-spatial experience

Goal: point at a diagram or real object, extract an animated model, inspect and modify it in a camera view or immersive environment.

Plan for this increment:
1. Replace automatic sample startup with explicit camera-first onboarding.
2. Share image extraction between camera capture and uploads. Send only captured frames.
3. Display camera surroundings in desktop preview, with manual model placement.
4. Detect VR and mixed-reality support independently. Remove opaque environment surfaces during passthrough.
5. Show loading and failure states, verify lifecycle and browser behavior, publish.

Boundaries: browser camera access depends on available devices. Meta's WebXR passthrough displays the room but does not expose its pixels for AI recognition. Upload/capture before immersion when camera access is unavailable. Calibrated registration, room reconstruction, native Quest camera access and depth occlusion remain separate work. Do not claim them implemented. Hardware acceptance is pending.

Reference: https://developers.meta.com/vr/documentation/web/webxr-mixed-reality/
