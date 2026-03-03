import { DependencyPolicy } from '../../modules/health/infrastructure/dependency.types'

export const API_DEPENDENCY_POLICY: DependencyPolicy = {
  redis: { critical: false },
  ds: { critical: false },
  hub: { critical: false },
  s3: { critical: false },
}
