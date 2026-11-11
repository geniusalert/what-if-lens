// Hysteresis prevents noisy hand joints from repeatedly activating a button.
export function pinchState(previous,distance){if(!Number.isFinite(distance)||distance<0)return false;return previous?distance<.035:distance<.022;}
export function boundExperimentScale(value){return Math.max(.025,Math.min(2,value));}
