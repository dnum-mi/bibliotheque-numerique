import type { Ref } from 'vue'


export const useRnfStore = defineStore('rnf', () => {
  const created: Ref<boolean> = ref(false)
  const rnfId: Ref<string> = ref('')
  const dossierId:Ref<string> = ref('')
  return {
    created,
    dossierId,
    rnfId,
  }
})
