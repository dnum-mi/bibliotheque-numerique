export interface iLogPayload {
  level: 'log' | 'warn' | 'debug' | 'error' | 'verbose' | 'info'
  application: string
  timestamp: string,
  message: string,
  requestId?: string,
  jobDescription?: string,
  userDescription?: string,
  userId?: number,
  demarcheDescription?: string,
  demarcheDsId?: number,
  dossierDescription?: string,
  dossierDsId?: number,
  payload?: object,
  context?: string,
}
