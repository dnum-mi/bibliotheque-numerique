export const NodeEnvs = {
  Local: 'local',
  TestUnit: 'test-unit',
  TestE2E: 'test-e2e',
  Production: 'production',
}

export type NodeEnv = (typeof NodeEnvs)[keyof typeof NodeEnvs];
