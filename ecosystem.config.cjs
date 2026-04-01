// PM2 Configuration for Google Cloud VM
module.exports = {
  apps: [{
    name: 'ethioradio-backend',
    script: 'server.ts',
    interpreter: 'node',
    interpreter_args: '--import tsx',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '800M',
    restart_delay: 5000,
    max_restarts: 20,
    min_uptime: '10s',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    time: true,
    // Kill timeout before force restart
    kill_timeout: 5000,
  }]
};
