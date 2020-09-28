import Queue from "bull";
import path from "path";

export const addQueue = new Queue("adding numbers", "redis://localhost:6379");

addQueue.process(async function (job) {
  const addition = new Promise((resolve) => {
    console.log("start job");
    setTimeout(() => {
      console.log("end job");
      return resolve(job.data.a + job.data.b);
    }, 4000);
  });
  return addition.then((v) => v);
});

export const pingQueue = new Queue(
  "ping ip addresses",
  "redis://localhost:6379"
);

const ext = process.env.NODE_ENV === "production" ? "js" : "ts";

pingQueue.process(5, path.join(__dirname, `pingProcess.${ext}`));

pingQueue.on("completed", (job, result) => {
  if (result) {
    // console.log(result);
    const isUp = ["0%", "0.0%"].includes(result.packetLoss);
    const resultText = isUp ? "up" : "down";
    console.log(
      `job id: ${job.id} is completed. output: ${job.data.url} is ${resultText}`
    );
  }
});
