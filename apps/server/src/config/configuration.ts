export type TConfig = {
  env: string;
  isDev: boolean;
  isTest: boolean;
  protocol: string;
  port: number;
  appFrontUrl: string;
  supportEmail: string;
  httpProxy: string;
  defaultAdmin: {
    email: string;
    roleName: string;
  }
  createMissingMandatoryConfigurations: boolean;
};

export default () : TConfig => ({
  env: process.env.NODE_ENV || 'development',
  isDev: ['local'].includes(process.env.NODE_ENV),
  isTest: ['test', 'test-unit', 'test-e2e'].includes(process.env.NODE_ENV),
  protocol: process.env.PROTOCOL || 'http',
  port: parseInt(process.env.PORT, 10) || 3000,
  appFrontUrl: process.env.APP_FRONT_URL || 'http://localhost:8080',
  supportEmail: process.env.SUPPORT_EMAIL || 'contact@bibliotheque-numerique.interieur.gouv.fr',
  httpProxy: process.env.http_proxy || '',
  defaultAdmin: {
    email: process.env.DEFAULT_SUDO_EMAIL,
    roleName: 'admin',
  },
  createMissingMandatoryConfigurations: process.env.CREATE_MISSING_MANDATORY_CONFIGURATIONS === 'true' || true,
})
