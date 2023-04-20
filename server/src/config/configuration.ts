const config = {
  protocol: process.env.PROTOCOL || `http`,
  port: parseInt(process.env.PORT, 10) || 3000,
  appHost: process.env.APP_HOST || `localhost:3000`,
  appPath: process.env.APP_PATH || `/`,
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
  smtp: {
    host: process.env.SMTP_SERVER || "localhost",
    port: process.env.SMTP_PORT || "25",
    from: process.env.MAIL_FROM || "noreply.biblio-num@interieur.gouv.fr",
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PWD,
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
export default () => config;
