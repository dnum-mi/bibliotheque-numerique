import { registerAs } from '@nestjs/config'

export default registerAs('cron', () => ({
  skipCronInitialization: process.env.CRON_SKIP_INITIALIZATION === 'true',
  syncAllDemarche: process.env.CRON_SYNC_ALL_DEMARCHE || '* 1 * * * *',
  syncAllRnfOrganisme: process.env.CRON_SYNC_RNF_ORGANISME || '* 1 * * * *',
  syncAllRnaOrganisme: process.env.CRON_SYNC_RNA_ORGANISME || '* 1 * * * *',
  computeTimeTracking: process.env.CRON_COMPUTE_TIME_TRACKING || '* 1 * * * *',
  computeOrganismeDDC: process.env.CRON_COMPUTE_ORGANISME_DDC || '* 2 * * * *',
}))
