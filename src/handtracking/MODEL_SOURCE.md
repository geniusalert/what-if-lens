# Local hand-tracking model

Google MediaPipe Hand Landmarker, float16 revision 1.
Source: https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task
SHA256: fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1

Runtime: @mediapipe/tasks-vision 1.2.3 pinned in package-lock.json. WASM/runtime scripts are copied from that package during the build and served from the app origin. Camera frames are processed locally for hand tracking. This is image-plane interaction, not calibrated real-world depth or an XR anchor.
