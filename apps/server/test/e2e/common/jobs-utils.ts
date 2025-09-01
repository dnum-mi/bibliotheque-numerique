import { Job, Queue } from 'bull'

const wait = (s = 200):Promise<boolean> => new Promise((resolve) => {
  setTimeout(() => {
    resolve(true)
  }, s)
})

export async function forceJobsFinished(syncQueue: Queue, jobsName?: string[]): Promise<Job[]> {
  // Get all active jobs, and wait for the job to be completed
  let jobsActive:Job[] = []
  let countCall = 0
  do {
    await wait()
    jobsActive = await syncQueue.getJobs(['active'])
    // if (jobsName && (jobsName.length >= jobs.length)) {
    await Promise.all(
      jobsActive.filter(job => jobsName === undefined ? true : jobsName.includes(job.name))
        .map(async (job) => {
          if (!job?.finishedOn) {
            await job?.finished()
          }
        }),
    )
    // }
    countCall++
  } while (jobsActive.length >= 3 && countCall < 10)
  return await syncQueue.getJobs(['completed'])
}

export async function deleteJobs(syncQueue: Queue, jobsName?: string[]): Promise<void> {
  const jobs = await syncQueue.getJobs(['active', 'completed', 'delayed', 'delayed', 'failed', 'paused', 'waiting'])
  await Promise.all(
    jobs.filter(job => jobsName === undefined ? true : jobsName.includes(job.name))
      .map(async (job) => await job?.remove()),
  )
}

export async function waitJobsFinished(syncQueue: Queue, jobsName?: string[]): Promise<void> {
  let jobs:Job[] = []
  let countCall = 0
  do {
    await wait(500)
    jobs = await syncQueue.getJobs(['active'])
    jobs = jobs.filter(job => jobsName === undefined ? true : jobsName.includes(job.name))
    countCall++
  } while ((jobs.length > 0) && (countCall < 10))
}
