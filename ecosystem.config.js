/**
 * PM2 process config for production (Hostinger VPS).
 * Guarantees NODE_ENV=production so Next.js serves the built app (not dev mode)
 * and pins the port the app listens on. Start with: pm2 start ecosystem.config.js
 */
module.exports = {
  apps: [
    {
      name: "heritage-edit",
      script: "server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      max_memory_restart: "600M",
    },
  ],
};
