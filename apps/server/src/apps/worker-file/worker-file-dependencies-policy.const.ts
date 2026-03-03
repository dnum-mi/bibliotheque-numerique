import { DependencyPolicy } from '../../modules/health/infrastructure/dependency.types'

export const WORKER_FILE_DEPENDENCY_POLICY: DependencyPolicy = {
  redis: { critical: true },
  ds: { critical: true },
  hub: { critical: false },
  s3: { critical: true },
}
