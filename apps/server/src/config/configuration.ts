export type TConfig = {
  env: string;
  isDev: boolean;
  isTest: boolean;
  protocol: string;
  port: number;
  appFrontUrl: string;
  supportFormUrl: string;
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
  supportFormUrl: process.env.SUPPORT_FORM_URL ||
    'https://demarches.numerique.gouv.fr/commencer/siaf-support-technique-et-juridique-aux-prefectures',
  httpProxy: process.env.http_proxy || '',
  defaultAdmin: {
    email: process.env.DEFAULT_SUDO_EMAIL,
    roleName: 'admin',
  },
  createMissingMandatoryConfigurations: process.env.CREATE_MISSING_MANDATORY_CONFIGURATIONS === 'true' || true,
})
