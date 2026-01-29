module.exports = {
  apps: [
    {
      name: 'afoce-backend',
      script: './dist/index.js',
      node_args: '--max-old-space-size=1024', // Set heap size limit
      instances: 'max', // Use all CPU cores
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Auto-restart settings
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Memory management - restart if exceeds 800MB
      max_memory_restart: '800M',
      
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Health monitoring
      watch: false, // Don't watch in production
      ignore_watch: ['node_modules', 'logs', 'uploads'],
      
      // Cron restart (optional - restart daily at 3 AM for memory cleanup)
      cron_restart: '0 3 * * *',
      
      // Environment variables
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
