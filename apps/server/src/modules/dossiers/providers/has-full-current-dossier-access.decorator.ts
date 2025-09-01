import { canAccessPrefectureInDemarche } from '@biblio-num/shared'
import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Dossier } from '../objects/entities/dossier.entity'

export const hasFullCurrentDossierAcces = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const dossier: Dossier = request.dossier
  const role = request.user.role

  return canAccessPrefectureInDemarche(
    dossier.prefecture,
    role,
    dossier.demarcheId,
  )
})
