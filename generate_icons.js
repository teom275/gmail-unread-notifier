const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Colors for the Gmail M logo
// Color version:
// Blue: #4285F4, Green: #34A853, Yellow: #FBBC04, Red: #EA4335, Dark Red: #C5221F
// Grayscale version:
// Neutral dark/mid/light grays that look great on both light and dark Chrome toolbars

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
</head>
<body style="margin:0; background: transparent;">
<script>
const SIZES = [16, 32, 48, 128];

function drawGmail(ctx, size, isGrayscale) {
  ctx.clearRect(0, 0, size, size);
  
  // Gmail icon viewBox is 0 49.4 512 399.42 -> aspect ratio ~ 512 / 399.42 = 1.28
  // Let's fit within the canvas with a slight padding for aesthetic balance
  const padding = size * 0.08;
  const availW = size - (padding * 2);
  const availH = size - (padding * 2);
  
  const vbW = 512;
  const vbH = 399.42;
  const vbY = 49.4;
  
  // Scale to fit
  const scale = Math.min(availW / vbW, availH / vbH);
  const drawW = vbW * scale;
  const drawH = vbH * scale;
  const offsetX = padding + (availW - drawW) / 2;
  const offsetY = padding + (availH - drawH) / 2;
  
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);
  ctx.translate(0, -vbY);
  
  const colors = isGrayscale ? {
    blue: '#9E9E9E',
    green: '#757575',
    yellow: '#BDBDBD',
    red: '#616161',
    darkRed: '#4A4A4A'
  } : {
    blue: '#4285F4',
    green: '#34A853',
    yellow: '#FBBC04',
    red: '#EA4335',
    darkRed: '#C5221F'
  };

  // Blue Left Flap
  ctx.fillStyle = colors.blue;
  ctx.beginPath();
  const p1 = new Path2D("M34.91 448.818h81.454V251L0 163.727V413.91c0 19.287 15.622 34.91 34.91 34.91z");
  ctx.fill(p1);

  // Green Right Flap
  ctx.fillStyle = colors.green;
  ctx.beginPath();
  const p2 = new Path2D("M395.636 448.818h81.455c19.287 0 34.909-15.622 34.909-34.909V163.727L395.636 251z");
  ctx.fill(p2);

  // Yellow Top Right Triangle
  ctx.fillStyle = colors.yellow;
  ctx.beginPath();
  const p3 = new Path2D("M395.636 99.727V251L512 163.727v-46.545c0-43.142-49.25-67.782-83.782-41.891z");
  ctx.fill(p3);

  // Red Center "M" V-Shape
  ctx.fillStyle = colors.red;
  ctx.beginPath();
  const p4 = new Path2D("M116.364 251V99.727L256 204.455 395.636 99.727V251L256 355.727z");
  ctx.fill(p4);

  // Darker Red Top Left Shadow/Fold
  ctx.fillStyle = colors.darkRed;
  ctx.beginPath();
  const p5 = new Path2D("M0 117.182v46.545L116.364 251V99.727L83.782 75.291C49.25 49.4 0 74.04 0 117.18z");
  ctx.fill(p5);

  ctx.restore();
}

async function renderAll() {
  const results = {};
  
  for (const size of SIZES) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Color
    drawGmail(ctx, size, false);
    results['color-' + size + '.png'] = canvas.toDataURL('image/png').split(',')[1];
    
    // BW
    drawGmail(ctx, size, true);
    results['bw-' + size + '.png'] = canvas.toDataURL('image/png').split(',')[1];
  }
  
  await fetch('/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(results)
  });
  
  document.body.innerHTML = '<h1>Done!</h1>';
}

window.onload = renderAll;
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } else if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      for (const [filename, base64] of Object.entries(data)) {
        fs.writeFileSync(path.join(iconsDir, filename), Buffer.from(base64, 'base64'));
        console.log('Saved: ' + filename);
      }
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');
      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 500);
    });
  }
});

server.listen(48921, () => {
  console.log('Server running on port 48921');
  const chromeCandidates = [
    process.env.CHROME_BIN,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ].filter(Boolean);

  const chromePath = chromeCandidates.find(p => fs.existsSync(p)) || 'chrome';
  const proc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    'http://localhost:48921'
  ]);
  proc.on('error', err => {
    console.error('Failed to spawn Chrome:', err);
    process.exit(1);
  });
});
