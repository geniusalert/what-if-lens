const chains = [[0,1,2,3,4],[0,5,6,7,8],[5,9,10,11,12],[9,13,14,15,16],[13,17,18,19,20],[17,0]];

export function createHandOverlay(canvas) {
  let previous, width, height;
  return function draw(hands, project) {
    if (!hands?.length) { canvas.hidden = true; previous = null; return; }
    canvas.hidden = false;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (previous === hands && width === w && height === h) return;
    previous = hands; width = w; height = h;
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    for (const hand of hands) {
      const points = hand.landmarks.map(p => { const uv = project(p); return [uv.x * w, uv.y * h]; });
      ctx.strokeStyle = '#83e3d3'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath();
      for (const chain of chains) {
        ctx.moveTo(...points[chain[0]]);
        for (const index of chain.slice(1)) ctx.lineTo(...points[index]);
      }
      ctx.stroke();
      points.forEach(([x,y], i) => {
        ctx.beginPath(); ctx.fillStyle = i === 4 || i === 8 ? '#ffce77' : '#e5fffa';
        ctx.arc(x, y, i === 4 || i === 8 ? 4 : 2.5, 0, Math.PI * 2); ctx.fill();
      });
    }
  };
}
