const config = {
  env: process.env.NODE_ENV || "development",
  isDev: ["dev", "development", "local"].includes(process.env.NODE_ENV),
  isTest: ["test", "test-unit", "test-e2e"].includes(process.env.NODE_ENV),
  protocol: process.env.PROTOCOL || `http`,
  port: parseInt(process.env.PORT, 10) || 3000,
  appHost: process.env.APP_HOST || `localhost:3000`,
  appPath: process.env.APP_PATH || ``,
  appFrontUrl: process.env.APP_FRONT_URL || "http://localhost:8080",
  log: {
    date_format: process.env.LOG_DATE_FORMAT || "DD/MM/YYYY HH:mm:ss",
  },
  typeOrganisme: {
    FDD: /^FDD$/,
    FE: /^FE$/,
    ARUP: /^ARUP$/,
    FRUP: /^FRUP$/,
    W9: /^W\d{9}$/,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  cookie: {
    maxAge: 3600000,
  },
  defaultAdmin: {
    email: process.env.DEFAULT_ADMIN_EMAIL,
    password: process.env.DEFAULT_ADMIN_PASSWORD,
    roleName: "admin",
  },
};

export type TConfig = typeof config;
// TODO: fixe type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default () => config;
