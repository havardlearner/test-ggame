const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Try to read the server port file
try {
  const port = fs.readFileSync(path.join(__dirname, '../.serverport'), 'utf8').trim();
  
  // Update .env file with the current port
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update or add the SERVER_PORT value
    if (envContent.includes('VITE_APP_SERVER_URL=')) {
      envContent = envContent.replace(
        /VITE_APP_SERVER_URL=http:\/\/localhost:\d+/,
        `VITE_APP_SERVER_URL=http://localhost:${port}`
      );
    } else {
      envContent += `\nVITE_APP_SERVER_URL=http://localhost:${port}\n`;
    }
  } else {
    envContent = `VITE_APP_SERVER_URL=http://localhost:${port}\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log(`Updated client .env with server port: ${port}`);
} catch (err) {
  console.error('Failed to read server port. Make sure the server is running.');
  process.exit(1);
} 