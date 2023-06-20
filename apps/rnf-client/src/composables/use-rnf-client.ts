import { ref , computed } from 'vue'
import { fetchRnfId } from '../api-client/index.js'

function useRfnClient () {
  const requesting = ref(false)
  const rnfId = ref('')
  const errorMessage = ref('')

  async function getRnfId (dossierId: number) {
    try {
      requesting.value = true
      errorMessage.value = ''
      rnfId.value = ''
      const res = await fetchRnfId(dossierId)
      const rnfResponseBody = await res.json()
      rnfId.value = rnfResponseBody.rnfId
    } catch (err) {
      errorMessage.value = err instanceof Error ? err.message : err as string
    } finally {
      requesting.value = false
    }
  }

  return {
    requesting: computed(() => requesting.value),
    rnfId: computed(() => rnfId.value),
    errorMessage: computed(() => errorMessage.value),
    getRnfId,
  }
}

export default useRfnClient
