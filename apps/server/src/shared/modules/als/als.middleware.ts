import { Injectable, NestMiddleware, Inject } from '@nestjs/common'
import { AsyncLocalStorage } from 'async_hooks'
import { v4 } from 'uuid'
import { ALS_INSTANCE } from '@/shared/modules/als/als.module'
import { AsyncLocalStore } from '@/shared/modules/als/async-local-store.type'

@Injectable()
export class AlsMiddleware implements NestMiddleware {
  constructor(
    @Inject(ALS_INSTANCE)
    private readonly als: AsyncLocalStorage<AsyncLocalStore>,
  ) {}

  use(req: unknown, res: unknown, next: () => void): void {
    const store: AsyncLocalStore = {
      requestId: v4(),
    }

    this.als.run(store, () => {
      next()
    })
  }
}
