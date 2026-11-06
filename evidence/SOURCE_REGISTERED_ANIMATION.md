# Source-registered animation direction

The previous photo overlay used the same generic reconstructed meshes, text billboards and thin ArrowHelpers as the lab. This obscured the photograph and produced straight diagonal arrows for curved structures.

## Runtime changes

- An observation now returns bounded, typed image-space paths separately from 3D equipment geometry. Curved structures request multiple visible contour samples, with explicit instructions about foreground occlusion and support placement.
- Real-object photos retain their original appearance. Reconstructed bodies and opaque text sprites are hidden in this view. The live camera remains live and the path layer inherits its existing tracking transform.
- Three.js screen-space strokes maintain readable pixel widths. White light sweeps move over the colored paths, with tapered arrowheads and contact markers. Mechanical transfer is a conceptual sweep, not electrical current or measured displacement.
- Deterministic force stories coordinate load, transfer and support response. Live controls allow continuous or step-based explanation, pause and label visibility.
- Bounded foreground polygons write only to the depth buffer. Photo force paths pass behind these occluders while the photograph remains visible; masks are never used in the lab.
- Projected DOM labels use leaders, measured widths and collision avoidance. Numerical results replace labels only after validated calculation; missing inputs clear old numerical labels. Switching views reapplies the current calculation.
- The 3D bridge now has extruded arch ribs, deck, spandrel posts, footings and parapets. Lab compression and reaction paths attach to that authored model, independently of the source photograph's perspective.
- Real-object equipment builds once; repeated explanation stages do not restart its assembly or silently pause its motion.
- Path animation updates material offsets without rebuilding GPU geometry. Existing restart, cancellation and stale-response protections remain.

## Verification

- 77 tests: numerical physics, source-coordinate bounds, invalid model output, deterministic stage/replay timing, curve shape, buffer reuse, mobile label packing and resource cleanup.
- Real Meta inference on the bridge/car photo returned a four-object 3D scene and five source paths in 31 seconds. A separate browser upload completed the full image → API → Meta → animation flow.
- Inspected bridge lab stages at 4.5 and 7.2 seconds and the 390 × 844 layout. The lab showed readable labels and complete framing. Corrected the removed Three.js soft-shadow constant warning.

## Limits

Paths and reconstructed geometry are illustrative. Vision-generated landmarks can still be approximate, especially at occlusions. The browser tracker is local 2D alignment, not calibrated spatial AR or an engineering assessment. Physical phone-camera tracking was not independently verified during this change. No coordinates from the test photograph were hard-coded into the application.
