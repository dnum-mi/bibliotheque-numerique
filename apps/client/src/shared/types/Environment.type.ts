export type EnvTextKeys = 'development' | 'staging' | 'preproduction' | 'production'
export const envTextMapping: { [key in EnvTextKeys]: string } = {
  development: 'Développement',
  staging: 'Qualification',
  preproduction: 'Préproduction',
  production: 'Production',
}

export const defaultEnv = 'production'
