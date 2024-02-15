export type TConfig = {
  env: string;
  name: string;
  isDev: boolean;
  isTest: boolean;
  protocol: string;
  port: number;
  appHost: string;
  appPath: string;
  appFrontUrl: string;
  supportEmail: string;
  httpProxy: string;
  log: {
    date_format: string;
  },
  cookie: {
    maxAge: number;
  },
  defaultAdmin: {
    email: string;
    roleName: string;
  }
  createMissingMandatoryConfigurations: boolean;
};

export default () : TConfig => ({
  env: process.env.NODE_ENV || 'development',
  name: process.env.APP_NAME || 'bibliotheque-numerique-api',
  isDev: ['local'].includes(process.env.NODE_ENV),
  isTest: ['test', 'test-unit', 'test-e2e'].includes(process.env.NODE_ENV),
  protocol: process.env.PROTOCOL || 'http',
  port: parseInt(process.env.PORT, 10) || 3000,
  appHost: process.env.APP_HOST || 'localhost:3000',
  appPath: process.env.APP_PATH || '',
  appFrontUrl: process.env.APP_FRONT_URL || 'http://localhost:8080',
  supportEmail: process.env.SUPPORT_EMAIL || 'contact@bibliotheque-numerique.interieur.gouv.fr',
  httpProxy: process.env.http_proxy || '',
  log: {
    date_format: process.env.LOG_DATE_FORMAT || 'DD/MM/YYYY HH:mm:ss',
  },
  cookie: {
    maxAge: 3600000,
  },
  defaultAdmin: {
    email: process.env.DEFAULT_SUDO_EMAIL,
    roleName: 'admin',
  },
  createMissingMandatoryConfigurations: process.env.CREATE_MISSING_MANDATORY_CONFIGURATIONS === 'true' || true,
})
