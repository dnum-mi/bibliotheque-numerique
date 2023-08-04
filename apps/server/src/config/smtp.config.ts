import { registerAs } from "@nestjs/config";

export default registerAs("smtp", () => ({
  host: process.env.SMTP_SERVER || "localhost",
  port: process.env.SMTP_PORT || "25",
  from: process.env.MAIL_FROM || "noreply.biblio-num@interieur.gouv.fr",
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PWD,
}));
