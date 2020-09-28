import { addQueue, pingQueue } from "./queue";
import Koa, { Context } from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import { generateUUID } from "./utils/generateUUID";
import Redis from "ioredis";
import render from "koa-ejs";
import path from "path";

export default function startServer() {
  const app = new Koa();
  const router = new Router();
  const redis = new Redis(6379, "localhost", { db: 0 });

  app.use(bodyParser());
  render(app, {
    root: path.join(__dirname, "view"),
    layout: "template",
    viewExt: "ejs",
    // cache: false,
    // debug: true,
  });

  router.get("/", async (ctx: any) => {
    await ctx.render("ping");
  });

  router.post("/ping", async (ctx) => {
    const body = ctx.request.body;
    const addresses = (body?.addresses as string).split(",");
    if (!addresses) {
      ctx.status = 400;
      return;
    }
    const jobGroupId = generateUUID();
    const addJobs = addresses.map((e) => {
      return pingQueue.add({ url: e });
    });
    const jobs = await Promise.all(addJobs);
    const jobIds = jobs.map((v) => v.id);
    await redis.lpush(jobGroupId, jobIds);
    ctx.redirect(`/ping/job/${jobGroupId}`);
  });

  router.get("/ping/job/:jobGroupId", async (ctx: any) => {
    const jobGroupId = ctx.params.jobGroupId;
    //TODO: to research why koa-ejs and koa-router ctx type dont play well
    await ctx.render("ping-result", {
      jobGroupId: jobGroupId,
    });
  });

  router.post("/ping/job/:jobGroupId", async (ctx) => {
    const jobGroupId = ctx.params.jobGroupId;
    const jobIds = await redis.lrange(jobGroupId, 0, -1);
    const jobGroupLength = jobIds.length;
    if (jobGroupLength === 0) {
      ctx.body = "job not found";
      return;
    }

    const getJobs = jobIds.map((jobId) => {
      const job = pingQueue.getJob(jobId);
      return job;
    });

    const jobs = await Promise.all(getJobs);

    const getCompletedJobs = jobs.map((job) => {
      return job.isCompleted();
    });

    const jobIsCompletedArr = await Promise.all(getCompletedJobs);

    const totalIsCompleted = jobIsCompletedArr.filter((v) => v).length;

    ctx.body = JSON.stringify({
      total: jobGroupLength,
      completed: totalIsCompleted,
      percentage: (totalIsCompleted / jobGroupLength) * 100,
    });
  });

  app.use(router.routes());

  app.listen(3000, () => {
    console.log("listening to http://localhost:3000");
  });
}
