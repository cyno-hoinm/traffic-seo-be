module.exports = {
    apps: [
      {
        name: "traffic-seo-be",
        script: "./dist/app.js",
        instances: 1, 
        exec_mode: "fork", 
        max_restarts: 5, 
        restart_delay: 1000,
        env: {
          NODE_ENV: "development",
          PORT: 9999, 
        },
        error_file: "./dist/logs/error.log",
        out_file: "./dist/logs/out.log",
      },
    ],
  };