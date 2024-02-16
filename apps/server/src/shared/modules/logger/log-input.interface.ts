export interface ILogInput {
  level: 'info' | 'error' | 'warn'
  message: string
  meta?: object
}
