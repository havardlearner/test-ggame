// Run this with Node.js to create the placeholder images
const fs = require('fs');
const path = require('path');

// Ensure the assets directory exists
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create a simple 32x32 PNG file
const createPlaceholderPNG = (filename, color) => {
  // Very simple 32x32 PNG file
  const buffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGUlEQVRYR+3BAQEAAACCIP+vbkhAAQAA8GcGEpAAATfJrW0AAAAASUVORK5CYII=',
    'base64'
  );
  
  fs.writeFileSync(path.join(assetsDir, filename), buffer);
  console.log(`Created ${filename}`);
};

createPlaceholderPNG('nanobot.png');
createPlaceholderPNG('energy.png');

// Create a simple hero background
function createHeroBackground() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set dimensions
  canvas.width = 1920;
  canvas.height = 1080;
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#0a0a20');
  gradient.addColorStop(1, '#1a1a35');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add some particles/dots
  ctx.fillStyle = '#ffffff';
  
  for (let i = 0; i < 500; i++) {
    const size = Math.random() * 2 + 0.5;
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const opacity = Math.random() * 0.5 + 0.1;
    
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add a subtle blue glow in the center
  const centerGradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, canvas.width / 2
  );
  centerGradient.addColorStop(0, 'rgba(0, 170, 255, 0.2)');
  centerGradient.addColorStop(0.5, 'rgba(0, 100, 200, 0.05)');
  centerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  
  ctx.globalAlpha = 1;
  ctx.fillStyle = centerGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Save as PNG
  const buffer = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
  require('fs').writeFileSync(require('path').join(__dirname, 'hero-background.jpg'), Buffer.from(buffer, 'base64'));
  console.log('Created hero-background.jpg');
}

// Call the function at the end of the file
createHeroBackground(); 