module.exports = {
  apps: [
    {
      name: "form-builder-pltgu",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3011",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3011,
      },
    },
  ],
};
