/* eslint-disable no-undef */
module.exports = {
  apps: [
    {
      name: "mr-backend",
      script: "dist/server.js",
      watch: ["dist"], // watch only dist folder
      ignore_watch: ["node_modules", "logs"], // ignore these
      watch_delay: 1000, // optional: debounce restarts (in ms)
    },
  ],
};
