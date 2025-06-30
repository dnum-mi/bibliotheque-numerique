import { Job } from 'bull'

const wait = new Promise((resolve) => {
  setTimeout(() => {
    resolve(true)
  }, 200)
})

export async function waitJobsFinished(syncQueue, jobsName?: string[]): Promise<Job[]> {
  // Get all active jobs, and wait for the job to be completed
  let jobs:Job[] = []
  let countCall = 0
  do {
    await wait
    jobs = await syncQueue.getJobs(['active', 'completed'])
    if (jobsName && (jobsName.length >= jobs.length)) {
      await Promise.all(
        jobs.map(async (job) => {
          if (!job?.finishedOn) {
            await job?.finished()
          }
        }),
      )
    }
    countCall++
  } while (jobs.length >= 3 && countCall < 10)
  return jobs
}
