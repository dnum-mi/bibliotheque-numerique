import axios from 'axios'

const baseApiUrl = import.meta.env?.API_URL || 'http://localhost:3000'
const headers = {
  'Content-Type': 'application/json',
}

export const apiClient = {
  getDemarche: async (id: number) => {
    const config = {
      method: 'get',
      url: `${baseApiUrl}/demarche/${id}`,
      headers,
    }
    const response = await axios(config)
    return response.data.demarche
  },
}
