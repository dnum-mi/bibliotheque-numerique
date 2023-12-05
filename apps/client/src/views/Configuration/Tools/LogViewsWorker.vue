<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getWorkersLogs } from '@/api/sudo-api-client'
import { dateTimeToStringFr } from '@/utils/date-to-string'
type LogJob = {
  id: number;
  jobName: string;
  jobStatus: string;
  log: string;
  createAt: string;
  updateAt: string;
  overAt: string;
}
const logJobs = ref<LogJob[]>([])
const loading = ref<boolean>(false)
const expandedId = ref()
const refreshLogs = async () => {
  loading.value = true
  logJobs.value = await getWorkersLogs().finally(() => {
    loading.value = false
  })
}

onMounted(() => {
  refreshLogs()
})
</script>

<template>
  <DsfrAccordion
    class="fr-pt-2w"
    title="Les logs du worker"
    :expanded-id="expandedId"
    @expand="expandedId = $event"
  >
    <div v-if="loading">
      En cours de chargement...
    </div>
    <DsfrButton
      type="button"
      label="Recharger"
      no-outline
      @click="refreshLogs()"
    />
    <DsfrTable class="w-full text-center">
      <thead>
        <th>id</th>
        <th>job</th>
        <th>état</th>
        <th>log</th>
        <th>crée le</th>
        <th>mise à jour le</th>
        <th>terminé le</th>
      </thead>
      <tbody>
        <tr
          v-for="logJob in logJobs"
          :key="logJob.id"
        >
          <td>{{ logJob.id }}</td>
          <td>{{ logJob.jobName }}</td>
          <td>{{ logJob.jobStatus }}</td>
          <td>{{ logJob.log }}</td>
          <td>{{ logJob.createAt? dateTimeToStringFr(logJob.createAt):'' }}</td>
          <td>{{ logJob.updateAt? dateTimeToStringFr(logJob.updateAt):'' }}</td>
          <td>{{ logJob.overAt? dateTimeToStringFr(logJob.overAt):'' }}</td>
        </tr>
      </tbody>
    </DsfrTable>
  </DsfrAccordion>
</template>
