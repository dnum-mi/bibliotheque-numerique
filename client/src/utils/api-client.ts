import axios from 'axios'

const baseApiUrl = import.meta.env?.API_URL || 'http://localhost:3000'
const headers = {
  'Content-Type': 'application/json',
}

export const apiClient = {
  getDemarcheByDsId: async (id: number) => {
    const config = {
      method: 'get',
      url: `${baseApiUrl}/demarches/ds/${id}`,
      headers,
    }
    const response = await axios(config)
    return response.data.demarche
  },
  getDemarche: async (id: number) => {
    const config = {
      method: 'get',
      url: `${baseApiUrl}/demarches/${id}`,
      headers,
    }
    const response = await axios(config)
    return response.data.demarche
  },
  getDemarches: async () => {
    const config = {
      method: 'get',
      url: `${baseApiUrl}/demarches`,
      headers,
    }
    const response = await axios(config)
    return response.data.demarches
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
