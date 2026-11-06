# Real-world camera science

The workspace now uses one image observation call for geometry, an explanation and typed scientific context. It no longer makes a separate classification call before constructing a scene. Camera JPEGs are capped at 1100 px and 0.8 quality; local rendering skips the inactive overlay and avoids repeated material traversal once reveals finish.

The standalone quadratic input panel was removed. The universal question bar accepts camera questions, local numerical what-ifs and equations through the same entry. Native browser speech recognition is offered only when available; audio is not uploaded to the app's backend. Hardware speech capture has not been certified in this environment.

Real Meta checks used a public photograph of a car under an arch bridge (https://emc2design.com/shop-porsche-997/9971-widebody-rear-splitters). It is held only in the ignored local test directory, not distributed in the application. Asking about the bridge returned nine objects and a qualitative load-path explanation in 37.4 seconds. Asking about car drag at 500 km/h returned nine objects and typed speed 500; Cd, area and density remained explicitly unknown. That call took 47.1 seconds. These are observed test durations, not latency guarantees.

A browser upload of the same real photo produced animated air paths and opposing drag over the photo. Supplying Cd=0.3, frontal area=2.2 m² and density=1.225 kg/m³ gave 7798.0324 N of drag using the constant-coefficient educational model; changing speed to 250 km/h gave one quarter of that force without an AI call. Optional rolling resistance is calculated separately, not conflated with aerodynamic drag.

The browser also answered the static-friction angle question: μs=0.4 gives θcritical=21.8014°, and sliding begins just above it. The exact onset angle is independent of mass in this model. Missing μk does not fabricate a kinetic acceleration. Bridge support reactions use an explicitly labelled two-support point-load beam idealization; curved-arch thrust and internal stresses are not solved from a photo.

71 tests pass, including unit conversion, independent numerical checks, unknown-input gates, geometry generation, translucent live overlays, question-to-context API handling, and existing reset/cancellation behavior. Physical phone capture, calibrated AR, arbitrary structural analysis, CFD and device-specific frame-rate certification are outside the verified claims.

Equations: https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/drag-equation/ and https://openstax.org/books/university-physics-volume-1/pages/6-2-friction
