import { exec } from "child_process";
import { parsePingResult } from "./utils/parsePingResult";
import promisify from "util.promisify";
const execWithPromise = promisify(exec);
import { Job } from "bull";

export default async (job: Job) => {
  const result = await execWithPromise(`ping -c 3 ${job.data.url}`);
  if (result.stdout) {
    return parsePingResult(result.stdout);
  }
  return null;
};
