export type TMapperJob = {
  name: string;
  cronTime: string;
  fct: () => Promise<void>;
  description: string;
};

export type TMapperJobs = TMapperJob[];
