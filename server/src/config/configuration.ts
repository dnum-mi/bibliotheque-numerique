export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  log: {
    date_format: process.env.LOG_DATE_FORMAT || "DD/MM/YYYY HH:mm:ss",
  },
});
