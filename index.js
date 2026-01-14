const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Spite.lol Biolink Platform...\n');

// Start backend server
const backend = spawn('npx', ['ts-node-dev', '--respawn', '--transpile-only', 'src/server.ts'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

// Wait for backend to start, then start frontend
setTimeout(() => {
  console.log('\n🎨 Starting Frontend...\n');
  const frontend = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5173'], {
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'inherit',
    shell: true,
    env: { ...process.env }
  });

  frontend.on('error', (err) => console.error('❌ Frontend error:', err));
}, 5000);

backend.on('error', (err) => console.error('❌ Backend error:', err));

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  backend.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down...');
  backend.kill();
  process.exit();
});
