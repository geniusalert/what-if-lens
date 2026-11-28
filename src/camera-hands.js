import * as THREE from 'three';
import {pinchRatio} from './hand-tracking.js';

export function cameraHandSamples(result, aspect = 1) {
  const names = result.handedness?.map(hand => hand[0]?.categoryName || 'hand') || [];
  return (result.landmarks || []).flatMap((landmarks, i) => {
    if (landmarks.length !== 21) return [];
    const point = j => new THREE.Vector3(landmarks[j].x * aspect, landmarks[j].y, 0);
    const name = names[i] || 'hand';
    const id = names.indexOf(name) === names.lastIndexOf(name) && names[i] ? name : name + '-' + i;
    return [{
      id, landmarks,
      uv: new THREE.Vector2((landmarks[4].x + landmarks[8].x) / 2, (landmarks[4].y + landmarks[8].y) / 2),
      ratio: pinchRatio(point(8), point(4), point(5), point(17))
    }];
  }).sort((a, b) => a.id.localeCompare(b.id));
}

export async function createCameraHands() {
  const {HandLandmarker, FilesetResolver} = await import('@mediapipe/tasks-vision');
  const files = await FilesetResolver.forVisionTasks('/handtracking');
  const detector = await HandLandmarker.createFromOptions(files, {
    baseOptions: {modelAssetPath: '/handtracking/hand_landmarker.task', delegate: 'CPU'},
    runningMode: 'VIDEO', numHands: 2,
    minHandDetectionConfidence: .5, minHandPresenceConfidence: .5, minTrackingConfidence: .5
  });
  const buffer = document.createElement('canvas');
  const context = buffer.getContext('2d');
  let lastVideoTime = -1, lastRun = -Infinity, closed = false;
  function detect(image, width, height, now) {
    const scale = Math.min(1, 640 / Math.max(width, height));
    if (scale < 1) {
      const w = Math.max(1, Math.round(width * scale)), h = Math.max(1, Math.round(height * scale));
      if (buffer.width !== w || buffer.height !== h) { buffer.width = w; buffer.height = h; }
      context.drawImage(image, 0, 0, w, h);
      image = buffer;
    }
    lastRun = now;
    return cameraHandSamples(detector.detectForVideo(image, now), width / height);
  }
  return {
    readFrame(image, now) {
      if (closed || now - lastRun < 120) return null;
      return detect(image, image.width, image.height, now);
    },
    read(video, now) {
      if (closed || video.readyState < 2 || video.currentTime === lastVideoTime || now - lastRun < 65) return null;
      lastVideoTime = video.currentTime;
      return detect(video, video.videoWidth, video.videoHeight, now);
    },
    dispose() { if (!closed) detector.close(); closed = true; }
  };
}
