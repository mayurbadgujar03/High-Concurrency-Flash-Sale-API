import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

import app from "./app.js";
import connectDB from "./db/index.js";
import cluster from "cluster";
import os from "os";

const PORT = process.env.PORT || 8000;

const totalCPUs = os.cpus().length;

if(cluster.isPrimary) {
  console.log(`Primary Manager ${process.pid} is running`);
  console.log(`Detected ${totalCPUs} cores. forking workers...`);
  
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Spawning a new one...`);
    cluster.fork();
  })
} else {
  connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
  })
  .catch((err) => {
    console.error("Mongodb connection error", err);
    process.exit(1);
  });
}


