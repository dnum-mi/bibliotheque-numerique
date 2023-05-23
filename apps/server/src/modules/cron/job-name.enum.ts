export const JobNames = {
  UNKNOWN_JOB: "no job name given.",
  FETCH_DATA_FROM_DS: "ds-data-fetching",
};

export type JobNamesKeys = (typeof JobNames)[keyof typeof JobNames];
