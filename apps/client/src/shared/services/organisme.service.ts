import axios from 'axios'
import { baseApiUrl, headers } from '@/utils/api-client'

export async function fetchOrganimseById (id: number): Promise<any | null> {
  try {
    const config = {
      method: 'get',
      url: `${baseApiUrl}/organismes/${id}/detail`,
      headers,
    }

    const response = await axios(config)
    return response.data
  } catch (error) {
    console.log(error)
  }
}

// Bouchon
export async function fetchOrganimseByIdRNA (id: string): Promise<any | null> {
  try {
    const config = {
      method: 'get',
      url: `${baseApiUrl}/organismes/rna/${id}`,
      headers,
    }
    const response = await axios(config)
    return response.data
  } catch (error) {
    console.log(error)
  }
}

export async function fetchOrganimses (): Promise<any | null> {
  try {
    const config = {
      method: 'get',
      url: `${baseApiUrl}/organismes`,
      headers,
    }
    const response = await axios(config)

    return response.data
  } catch (error) {
    console.log(error)
  }
}
