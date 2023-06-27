export const NodeEnv = {
  Local: "local",
  TestUnit: "test-unit",
  TestE2E: "test-e2e",
  Production: "production",
};

export type NodeEnv = (typeof NodeEnv)[keyof typeof NodeEnv];
