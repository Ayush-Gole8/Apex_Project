/**
 * Port Checker Utility
 * This script checks if port 3001 is in use and helps diagnose connectivity issues
 */

const net = require('net');
const os = require('os');
const { exec } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}┌────────────────────────────────────┐${colors.reset}`);
console.log(`${colors.cyan}│     Apex Backend Port Checker      │${colors.reset}`);
console.log(`${colors.cyan}└────────────────────────────────────┘${colors.reset}`);
console.log(`\nChecking if port 3001 is available...\n`);

// Check if the port is in use
const server = net.createServer();

server.once('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.log(`${colors.red}✘ Port 3001 is already in use!${colors.reset}`);
    
    // On Windows, use netstat to find what's using the port
    if (process.platform === 'win32') {
      console.log(`\n${colors.yellow}Finding process using port 3001...${colors.reset}`);
      
      exec('netstat -ano | findstr :3001', (error, stdout, stderr) => {
        if (error) {
          console.log(`${colors.red}Error finding process: ${error.message}${colors.reset}`);
          return;
        }
        
        if (stderr) {
          console.log(`${colors.red}Error: ${stderr}${colors.reset}`);
          return;
        }
        
        if (stdout) {
          console.log(`\n${colors.yellow}Results:${colors.reset}`);
          console.log(stdout);
          
          // Extract PID(s) from the output
          const pids = new Set();
          const lines = stdout.trim().split('\n');
          
          lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 5) {
              pids.add(parts[4]);
            }
          });
          
          if (pids.size > 0) {
            console.log(`\n${colors.yellow}Process ID(s) using port 3001: ${Array.from(pids).join(', ')}${colors.reset}`);
            
            // Get more info about these processes
            pids.forEach(pid => {
              exec(`tasklist /fi "PID eq ${pid}" /fo list`, (error, stdout, stderr) => {
                if (!error && !stderr) {
                  console.log(`\n${colors.yellow}Process details for PID ${pid}:${colors.reset}`);
                  console.log(stdout);
                }
              });
            });
            
            console.log(`\n${colors.magenta}To kill a process:${colors.reset}`);
            console.log(`${colors.magenta}1. Run 'taskkill /PID <PID> /F' (replace <PID> with the process ID)${colors.reset}`);
            console.log(`${colors.magenta}2. Or use Task Manager to end the task${colors.reset}`);
          }
        } else {
          console.log(`${colors.yellow}No process found using port 3001 directly, but the port is in use.${colors.reset}`);
        }
      });
    } else {
      // For non-Windows platforms
      console.log(`\n${colors.yellow}To find out what's using port 3001, run:${colors.reset}`);
      console.log(`${colors.magenta}lsof -i :3001${colors.reset}`);
      console.log(`\n${colors.yellow}To kill the process:${colors.reset}`);
      console.log(`${colors.magenta}kill -9 <PID>${colors.reset}`);
    }
    
    console.log(`\n${colors.yellow}Alternatives:${colors.reset}`);
    console.log(`${colors.yellow}1. Stop the existing server using port 3001${colors.reset}`);
    console.log(`${colors.yellow}2. Change the port in the .env file to another port (e.g., 3002)${colors.reset}`);
    console.log(`${colors.yellow}3. Update the frontend API_BASE_URL to match the new port${colors.reset}`);
  } else {
    console.log(`${colors.red}Error checking port: ${err.message}${colors.reset}`);
  }
});

server.once('listening', () => {
  console.log(`${colors.green}✓ Port 3001 is available and can be used by the Apex backend server${colors.reset}`);
  
  // Check network interfaces
  const networkInterfaces = os.networkInterfaces();
  console.log(`\n${colors.cyan}Network interfaces:${colors.reset}`);
  
  Object.keys(networkInterfaces).forEach(interfaceName => {
    const interfaces = networkInterfaces[interfaceName];
    interfaces.forEach(iface => {
      if (iface.family === 'IPv4') {
        console.log(`${colors.cyan}• ${interfaceName}: ${iface.address} (${iface.internal ? 'internal' : 'external'})${colors.reset}`);
      }
    });
  });
  
  console.log(`\n${colors.green}✓ When the server is running, you should be able to access:${colors.reset}`);
  console.log(`${colors.cyan}• http://localhost:3001/api/ping${colors.reset}`);
  
  server.close();
});

server.listen(3001, '127.0.0.1');