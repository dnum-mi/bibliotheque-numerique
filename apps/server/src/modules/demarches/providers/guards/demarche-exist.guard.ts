import { DemarcheService } from '../services/demarche.service'
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

@Injectable()
export class DemarcheExistGuard implements CanActivate {
  constructor (private service: DemarcheService) {}

  canActivate (context: ExecutionContext): boolean | Promise<boolean> {
    const no = (): void => {
      throw new NotFoundException('No demarche with this id')
    }
    const id = parseInt(
      context.switchToHttp().getRequest().params.demarcheId || '',
    )
    if (!id) {
      no()
    }
    return this.service.repository
      .findOne({ where: { id }, select: ['id', 'mappingColumns'] })
      .then((demarche) => {
        if (!demarche) {
          no()
        }
        context.switchToHttp().getRequest().params.demarche = demarche
        return true
      })
  }
}
