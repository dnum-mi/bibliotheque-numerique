
export type TConfig = {
  port: number;
  fetchDataInterval: string;
  fetchOrgInterval: string;
  fetchDataOnStartup: boolean;
  fetchDataOnStartupFromScratch: boolean;
  log: {
    date_format: string;
  };
  typeOrganisme: Record<string, RegExp>;
}

const config = (): TConfig => ({
  port: parseInt(process.env.WORKER_PORT, 10) || 3042,
  fetchDataInterval: process.env.WORKER_FETCH_DATA_INTERVAL || '0 0 1 * * *',
  fetchOrgInterval: process.env.WORKER_FETCH_ORG_INTERVAL || '0 0 1 * * *',
  fetchDataOnStartup: process.env.WORKER_FETCH_DATA_ON_STARTUP
    ? process.env.WORKER_FETCH_DATA_ON_STARTUP === 'true'
    : true,
  fetchDataOnStartupFromScratch: process.env.WORKER_FETCH_DATA_ON_STARTUP_FROM_SCRATCH
    ? process.env.WORKER_FETCH_DATA_ON_STARTUP_FROM_SCRATCH === 'true'
    : false,
  log: {
    date_format: process.env.LOG_DATE_FORMAT || 'DD/MM/YYYY HH:mm:ss',
  },
  typeOrganisme: {
    FDD: /^FDD$/,
    FE: /^FE$/,
    ARUP: /^ARUP$/,
    FRUP: /^FRUP$/,
    W9: /^W\d{9}$/,
  },
})

export default config
