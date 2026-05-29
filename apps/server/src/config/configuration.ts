export type TConfig = {
  env: string;
  runEnv: string;
  isDev: boolean;
  isTest: boolean;
  isProd: boolean;
  isFriendlyLog: boolean;
  protocol: string;
  port: number;
  appFrontUrl: string;
  supportFormUrl: string;
  httpProxy: string;
  defaultAdmin: {
    email: string;
    roleName: string;
  };
  workerFilePort: number;
  workerSyncPort: number;
  intervalHealthCheck: number;
  DsTimeout: number;
  HubTimeout: number;
};

export default (): TConfig => {
  const env = process.env.NODE_ENV?.trim()
  const runEnv = process.env.RUN_ENV?.trim() || 'local'
  const isDev = runEnv === 'local'
  const isTest = ['test', 'test-unit', 'test-e2e'].includes(env)
  const isProd = env === 'production'

  return {
    env,
    runEnv,
    isDev,
    isTest,
    isProd,
    isFriendlyLog: isDev && !isProd && !isTest,

    protocol: process.env.PROTOCOL || 'http',
    port: parseInt(process.env.PORT, 10) || 3000,

    workerFilePort: parseInt(process.env.WORKER_FILE_PORT, 10) || 3043,
    workerSyncPort: parseInt(process.env.WORKER_SYNC_PORT, 10) || 3042,

    appFrontUrl: process.env.APP_FRONT_URL || 'http://localhost:8080',

    supportFormUrl:
      process.env.SUPPORT_FORM_URL ||
      'https://demarches.numerique.gouv.fr/commencer/siaf-support-technique-et-juridique-aux-prefectures',

    httpProxy: process.env.http_proxy || '',

    defaultAdmin: {
      email: process.env.DEFAULT_SUDO_EMAIL,
      roleName: 'admin',
    },

    intervalHealthCheck: parseInt(process.env.INTERVAL_HEALTH_CHECK, 10) || 10,
    DsTimeout: parseInt(process.env.DS_TIMEOUT, 10) || 3,
    HubTimeout: parseInt(process.env.HUB_TIMEOUT, 10) || 3,
  }
}
