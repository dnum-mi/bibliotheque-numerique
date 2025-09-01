import { apiClientAuthInstance } from '@/api/api-client'

export const logInServer = (message: string | undefined, level: 'error' | 'warn' | 'info') => {
  apiClientAuthInstance.post('/logging', { message, level })
}
