export type TConfig = {
  env: string;
  isDev: boolean;
  isTest: boolean;
  protocol: string;
  port: number;
  appHost: string;
  appPath: string;
  appFrontUrl: string;
  httpProxy: string;
  log: {
    date_format: string;
  },
  cookie: {
    maxAge: number;
  },
  defaultAdmin: {
    email: string;
    password: string;
    roleName: string;
  }
};

export default () : TConfig => ({
  env: process.env.NODE_ENV || 'development',
  isDev: ['dev', 'development', 'local'].includes(process.env.NODE_ENV),
  isTest: ['test', 'test-unit', 'test-e2e'].includes(process.env.NODE_ENV),
  protocol: process.env.PROTOCOL || 'http',
  port: parseInt(process.env.PORT, 10) || 3000,
  appHost: process.env.APP_HOST || 'localhost:3000',
  appPath: process.env.APP_PATH || '',
  appFrontUrl: process.env.APP_FRONT_URL || 'http://localhost:8080',
  httpProxy: process.env.http_proxy || '',
  log: {
    date_format: process.env.LOG_DATE_FORMAT || 'DD/MM/YYYY HH:mm:ss',
  },
  cookie: {
    maxAge: 3600000,
  },
  defaultAdmin: {
    email: process.env.DEFAULT_ADMIN_EMAIL,
    password: process.env.DEFAULT_ADMIN_PASSWORD,
    roleName: 'admin',
  },
})
