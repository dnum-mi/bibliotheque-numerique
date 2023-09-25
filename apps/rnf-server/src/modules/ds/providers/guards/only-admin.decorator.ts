import { applyDecorators, UseGuards } from '@nestjs/common'
import { PasswordGuard } from '@/modules/ds/providers/guards/admin.guard'

export function OnlyAdmin() {
  return applyDecorators(
    UseGuards(PasswordGuard),
  )
}
