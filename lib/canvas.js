import { loadImage, createCanvas } from 'canvas';

async function levelup(text, level) {
  const img = await loadImage('https://i.imgur.com/k6k3x1h.jpg');
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  ctx.font = 'bold 40px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(text, canvas.width / 2, 50);
  ctx.font = 'bold 100px sans-serif';
  ctx.fillText(level, canvas.width / 2, 150);
  return canvas.toBuffer();
}

export { levelup };