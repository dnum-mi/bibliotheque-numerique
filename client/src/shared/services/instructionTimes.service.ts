import axios from 'axios'
import { baseApiUrl, headers } from '@/utils/api-client'
import type { TypeInstructionTimes } from '../types/instructionTime.type'

const axiosInstructionTimes = axios.create({
  baseURL: `${baseApiUrl}/instruction-times`,
  headers,
})

export async function fetchInstructionTimeByDossiers (ids: number[]) :Promise<TypeInstructionTimes> {
  try {
    const instructionTimes:TypeInstructionTimes = await axiosInstructionTimes.get(`/dossiers/times?ids=${ids}`)
    return instructionTimes
  } catch (error) {
    console.log(error)
  }
}
