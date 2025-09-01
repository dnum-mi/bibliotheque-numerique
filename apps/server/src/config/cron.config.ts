import { registerAs } from '@nestjs/config'

export default registerAs('cron', () => ({
  skipCronInitialization: process.env.CRON_SKIP_INITIALIZATION === 'true',
  syncAllDemarche: process.env.CRON_SYNC_ALL_DEMARCHE || '0 1 * * * *',
  syncAllRnfOrganisme: process.env.CRON_SYNC_RNF_ORGANISME || '0 1 * * * *',
  syncAllRnaOrganisme: process.env.CRON_SYNC_RNA_ORGANISME || '0 1 * * * *',
  computeTimeTracking: process.env.CRON_COMPUTE_TIME_TRACKING || '0 1 * * * *',
  computeOrganismeDDC: process.env.CRON_COMPUTE_ORGANISME_DDC || '0 2 * * * *',
  anonymiseDossiers: process.env.CRON_ANONYMISE_DOSSIER || '0 3 * * * *',
}))
