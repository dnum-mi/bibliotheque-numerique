export const JobStatus = {
  SUCCESS: "success",
  FAILURE: "failure",
  RUNNING: "running",
};

export type JobStatusValues = (typeof JobStatus)[keyof typeof JobStatus];
