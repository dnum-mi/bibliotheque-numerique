import { eJobName, JobNameKey } from '../objects/const/job-name.enum'
import {
  AnyJobPayload,
  SyncOneDemarcheJobPayload,
  SyncOneDossierJobPayload,
  SyncOneRnaOrganismeJobPayload,
  SyncOneRnfOrganismeJobPayload,
} from '../objects/const/job-payload.type'

export function buildRedisKey(jobName: JobNameKey, key: string): string {
  return `${jobName}:${key}`
}

export function getKeyIdentifier(
  jobName: JobNameKey,
  payload: AnyJobPayload,
): string | null {
  switch (jobName) {
  case eJobName.SyncOneDemarche:
    return `demarche:${(payload as SyncOneDemarcheJobPayload).demarcheId.toString()}`
  case eJobName.SyncOneDossier:
    return `dossier:${(payload as SyncOneDossierJobPayload).dsDossierId.toString()}`
  case eJobName.SyncOneRnaOrganisme:
    return `rna:${(payload as SyncOneRnaOrganismeJobPayload).rna.toString()}`
  case eJobName.SyncOneRnfOrganisme:
    return `rnf:${(payload as SyncOneRnfOrganismeJobPayload).rnf.toString()}`
  default:
    return null
  }
}
