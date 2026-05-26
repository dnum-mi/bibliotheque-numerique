import { DynamicModule, Global, Module } from '@nestjs/common'

import {
  APP_NAME_SYMBOL,
  HEALTH_DEPENDENCY_POLICY_SYMBOL,
} from '@/apps/apps.const'
import { DependencyPolicy } from '@/modules/health/infrastructure/dependency.types'

// Ce module sert à partager des variables propres aux différentes app dans le system d'injection de dépendance NestJs.
@Global()
@Module({})
export class AppContextModule {
  static register(appName: string, policy: DependencyPolicy): DynamicModule {
    return {
      module: AppContextModule,
      providers: [
        {
          provide: APP_NAME_SYMBOL,
          useValue: appName,
        },
        {
          provide: HEALTH_DEPENDENCY_POLICY_SYMBOL,
          useValue: policy,
        },
      ],
      exports: [APP_NAME_SYMBOL, HEALTH_DEPENDENCY_POLICY_SYMBOL],
    }
  }
}
