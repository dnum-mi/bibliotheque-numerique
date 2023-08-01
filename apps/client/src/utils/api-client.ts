import axios from 'axios'

export const baseApiUrl = import.meta.env?.API_URL || '/api'
export const headers = {
  'Content-Type': 'application/json',
}

export const apiClientInstance = axios.create({
  baseURL: baseApiUrl,
  headers,
})

export const apiClient = {
  getDemarcheByDsId: async (id: number) => {
    const config = {
      method: 'get',
      url: `${baseApiUrl}/demarches/ds/${id}`,
      headers,
    }
    const response = await axios(config)
    return response.data
  },
  getDemarche: async (id: number) => {
    const config = {
      method: 'get',
      url: `${baseApiUrl}/demarches/${id}`,
      headers,
    }
    const response = await axios(config)
    return response.data
  },
  getDemarches: async () => {
    const config = {
      method: 'get',
      url: `${baseApiUrl}/demarches`,
      headers,
    }
    const response = await axios(config)
    return response.data
  },
  getDossiersFromDemarche: async (id: number) => {
    const config = {
      method: 'get',
      url: `${baseApiUrl}/demarches/${id}/dossiers`,
      headers,
    }
    const response = await axios(config)
    return response.data
  },

  getDossiers: async (id?: number) => {
    const extPath = id ? `/${id}` : ''
    const config = {
      method: 'get',
      url: `${baseApiUrl}/dossiers${extPath}`,
      headers,
    }
    const response = await axios(config)
    return response.data
  },
  getDossier: async (id: number) => {
    const config = {
      method: 'get',
      url: `${baseApiUrl}/dossiers/${id}/detail`,
      headers,
    }
    const response = await axios(config)
    return response.data
  },
}
