import { Job } from 'bull'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'
import { User } from '@/modules/users/objects/user.entity'
import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'

export type AsyncLocalStore = {
  job?: Job
  requestId?: string
  user?: User,
  demarche?: Demarche,
  dossier?: Dossier,
}
