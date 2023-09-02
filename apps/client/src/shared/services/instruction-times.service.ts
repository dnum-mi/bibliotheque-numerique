import axios from 'axios'

import { baseApiUrl, headers } from '@/api/api-client'
import type { TypeInstructionTimes } from '@/shared/types/InstructionTime.type'

const axiosInstructionTimes = axios.create({
  baseURL: `${baseApiUrl}/instruction-times`,
  headers,
})

export async function fetchInstructionTimeByDossiers (ids: number[]): Promise<TypeInstructionTimes> {
  try {
    const response = await axiosInstructionTimes.get(`/dossiers/times?ids=${ids}`)
    const instructionTimes:TypeInstructionTimes = response.data
    return instructionTimes
  } catch (error) {
    // TODO: Afficher une erreur compréhensible à l’utilisateur
  }
}
