import { reactive, ref, computed } from 'vue'
import { fetchRnfId } from '../api-client/index.js'

// TODO: move this into shared
type AddressOutputDto = {
  id: number;
  createdAt: string;
  updatedAt: string;
  label: string;
  type: string;
  streetAddress: string;
  streetNumber: string;
  streetName: string;
  postalCode: string;
  cityName: string;
  cityCode: string;
  departmentName: string;
  departmentCode: string;
  regionName: string;
  regionCode: string;
}

export type FoundationOutputDto = {
  id: number;
  createdAt: string;
  updatedAt: string;
  rnfId: string;
  type: string;
  department: string;
  title: string;
  addressId: number;
  phone: string;
  email: string;
  address: AddressOutputDto;
}

export type CurrentFoundationOutputDto = Omit<FoundationOutputDto, 'rnfId'|'createdAt'|'updatedAt'>

export type InfoDSOutputDto = {
  demarcheId: Number;
  dossierId: Number;
}

type FoundationCollisionOutputDto = {
  collisionFoundations: FoundationOutputDto[],
  currentFoundation: CurrentFoundationOutputDto,
  ds: InfoDSOutputDto,
}


function useRnfClient() {
  const requesting = ref(false)
  const rnfId = ref('')
  const errorMessage = ref('')
  const collisions: FoundationOutputDto[] = reactive([])
  const currentFoundation: Ref<CurrentFoundationOutputDto> = ref({}) as Ref<CurrentFoundationOutputDto>
  const ds:Ref<InfoDSOutputDto | undefined> = ref(undefined)

  async function getRnfId(dossierId: number, instructeurEmail: string, force: boolean) {
    try {
      requesting.value = true
      errorMessage.value = ''
      rnfId.value = ''
      const res = await fetchRnfId(dossierId, instructeurEmail, force)
      const rnfResponseBody = await res.json()


      if (res.status === 409) {
        const { data: foundationsCollision }: { data: FoundationCollisionOutputDto } = rnfResponseBody
        collisions.length = 0
        collisions.push(...foundationsCollision.collisionFoundations)
        currentFoundation.value = foundationsCollision.currentFoundation
        ds.value = foundationsCollision.ds
        return
      }
      rnfId.value = rnfResponseBody.rnfId
      ds.value = rnfResponseBody.ds
    } catch (err) {
      errorMessage.value = err instanceof Error ? err.message : (err as string)
    } finally {
      requesting.value = false
    }
  }

  return {
    requesting: computed(() => requesting.value),
    rnfId: computed(() => rnfId.value),
    errorMessage: computed(() => errorMessage.value),
    getRnfId,
    collisions,
    currentFoundation,
    ds,
  }
}

export default useRnfClient
