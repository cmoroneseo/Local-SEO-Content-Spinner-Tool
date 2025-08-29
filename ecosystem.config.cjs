module.exports = {
  apps: [
    {
      name: 'local-seo-spinner',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=local-seo-production --local --ip 0.0.0.0 --port 3000',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
}