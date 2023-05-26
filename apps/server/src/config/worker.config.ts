const config = {
  port: parseInt(process.env.WORKER_PORT, 10) || 3042,
  fetchDataInterval: process.env.WORKER_FETCH_DATA_INTERVAL || "0 0 1 * * *",
  fetchDataOnStartup:
    process.env.WORKER_FETCH_DATA_ON_STARTUP === "true" || "true",
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
};

export type TConfig = typeof config;
// TODO: fixe type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default () => config;
