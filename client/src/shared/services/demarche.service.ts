import type { IDemarcheMappingColonne } from '../interfaces'
import { baseApiUrl, headers } from '../../utils/api-client'
import axios from 'axios'

const DEMARCHE_BASE_URL = `${baseApiUrl}/demarches`
const DEMARCHE_CONFIG_URL = `${DEMARCHE_BASE_URL}/configurations`

export async function updateConfigurations (demarcheMappingColonne: IDemarcheMappingColonne) {
  try {
    const response = await axios({
      method: 'PATCH',
      url: DEMARCHE_CONFIG_URL,
      data: JSON.stringify(demarcheMappingColonne),
      headers,
    })
    return response.data
  } catch (error) {
    throw await error
  }
}

export async function getConfigurations () {
  try {
    const response = await axios({
      method: 'get',
      url: DEMARCHE_CONFIG_URL,
      headers,
    })
    return response.data
  } catch (error) {
    throw await error
  }
}
