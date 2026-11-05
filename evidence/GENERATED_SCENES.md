# Diagram-to-animation verification

The reported failure had two causes: pulley mechanics was outside the numerical solver whitelist, and unsupported recognition returned description text without calling a renderer. Both routes now construct animated scene geometry.

The source image is sent to Meta as untrusted image data. A bounded schema specifies objects (primitive, position, size, rotation, colour), paths and motion. Validation rejects empty scenes, static-only scenes, unsupported executable object types, invalid vectors and excessive geometry. Model-generated code is never run.

## Verified

- The supplied connected-block/pulley screenshot was sent to the real Meta API. It returned a validated scene with ten objects and three animated objects. See generated-pulley-scene.json for the actual response and request trace.
- The other supplied screenshot also returned a validated Atwood-machine scene: twelve objects, nine animated. See generated-atwood-scene.json. Both real requests required one bounded repair attempt before passing validation.
- Browser upload of the same screenshot through Scientific Lab returned eleven objects, seven animated. The renderer displayed two blocks, horizontal platform, inclined platform, a rotating pulley, ropes and forces. The camera overlay reused the same scene with no extra prompt. Browser console had no errors.
- Separate exact-model equations and generated illustrative scenes retain different provenance. Unknown measurements are assumptions, not measured data.
- Ropes and force arrows near moving bodies follow those bodies; common pulley phases are coordinated by the generated scene.
- Physical camera capture remains unverified in the embedded browser. Live registration is approximate. Poor tracking keeps an explicitly approximate overlay visible rather than silently hiding all geometry.

57 automated tests cover geometry validation, real mesh creation and motion transforms, non-static output, opposite pulley displacement, generated-scene API output, scene edits, existing solvers and concurrent request de-duplication. Screenshot evidence is in the sibling reference directory in the local workspace.
