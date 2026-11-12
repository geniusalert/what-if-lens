# VR-first transition: plan and acceptance

1. **Two destinations:** replace mathematics-led landing content with Mixed Reality / VR and Scientific Lab. Open Lens and legacy #camera enter the spatial workspace. #lab opens only the scientific lab. Retain a #home introduction with both destinations and direct immersive entry.
2. **Mixed reality first:** prefer immersive-ar with VR in a mode selector. Browser immersive sessions require a user action; no automatic permission bypass. Capture/upload stays inside this workspace, not a third live-camera product. Camera pixels are device-dependent: passthrough is not automatic camera access.
3. **Stable placement:** disable SDK/shared-renderer automatic reframing, orbit damping drift and resize recentering in immersive sessions. Pause model timelines at creation and after edits. Preserve placement across AI edits. No autonomous camera approach/retreat.
4. **Direct manipulation:** headset hand-joint pinches move objects; two pinches scale/rotate. Pulling a moving generated mass scrubs the existing shared mechanism timeline so connected ropes/pulleys follow, then stays at the released state. This is bounded illustrative interaction, not a new exact general physics engine. Touch/pointer equivalent for browser preview. A phone RGB feed alone does not supply WebXR hand joints.
5. **One assistant:** replace spatial control trays with a model-adjacent ✦. Tap/pinch opens prompt + voice; a compact settings disclosure retains necessary capture/session/file tools. XR voice and a spatial keyboard provide input when DOM text fields are unavailable.
6. **Verification:** unit tests for scale bounds, stable grab offsets and pull timeline selection; browser desktop/mobile checks for routes, paused state, assistant and framing; build and deploy. Hardware gestures, passthrough capture and spatial voice require physical-device acceptance and must not be marked verified here.

Meta browser reference: https://developers.meta.com/vr/documentation/web/webxr-mixed-reality/


## Implemented and verified this increment
- Default / and legacy #camera enter #xr. #home introduces two destinations without equation-led marketing; Open Lens enters XR; home Enter mixed reality requests the session directly from a user click. #lab opens Scientific Lab explicitly.
- MR / VR selector in the spatial header; optional raw-camera-access capture, with honest fallback errors. Uses the pinned IWSDK adoption helper for lifecycle consistency. This optional path is built but has not been tested on physical XR camera hardware.
- Shared renderer skips XR reframing; timelines initialize paused, stay paused after edits, and explicitly requested animation plays one cycle. AI edits preserve the object's existing placement.
- Hand/controller and pointer gesture implementation added. Two tracked pinches scale and rotate around their midpoint; pulling a generated moving mass selects a shared mechanism time. Tests verify opposite connected mass motion. RGB camera finger recognition is not implemented or claimed.
- Spatial tray replaced with a model-adjacent circular AI star; speak/type/capture appear on demand. Browser star opens a text/voice panel with settings collapsed.
- 103 tests pass. Real browser verified landing → Open Lens, explicit Scientific Lab route, default root → XR, desktop/mobile assistant, imported illustrative pulley paused at rest, actual pointer drag pulling one weight while the other rises, and stable released state. No browser console errors reported. Hardware gestures, microphone capture and raw-camera capture remain physical-device acceptance gates.
