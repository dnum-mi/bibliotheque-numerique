import type { Ref } from 'vue'

import { fetchUrlDS } from '../api-client'

export const useRnfStore = defineStore('rnf', () => {

  const created: Ref<boolean> = useStorage('rnfCreated', false)
  const rnfId: Ref<string> = useStorage('rnfId', '')
  const dossierId:Ref<string> = useStorage('dossierId', '')
  let urlDs: string | undefined

  const getUrlDs = async () => {
    if(!urlDs) {
      urlDs = await fetchUrlDS()
    }
    return urlDs
  }

  getUrlDs()

  return {
    created,
    dossierId,
    rnfId,
    getUrlDs,
  }
})
