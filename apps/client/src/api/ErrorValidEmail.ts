import type { AxiosError } from 'axios'

const validateEmailFeedback = {
  401: 'Le token est absent, veuillez fournir un token valide.',
  403: 'Token invalide ou expiré, veuillez fournir un token valide.',
  409: 'Vous avez déjà valider votre adresse courriel.',
  200: 'Votre adresse courriel est validé.',
  default: 'Une erreur inconnue est survenue.',
} as const
type keyValidateEmailFeedback = keyof typeof validateEmailFeedback

export class ErrorvalidateEmail extends Error {
  feedbackCode: keyValidateEmailFeedback
  status: number|undefined
  constructor (error: AxiosError) {
    const feedbackCode = (String(error.response?.status)) as keyof typeof validateEmailFeedback
    super(validateEmailFeedback[feedbackCode] ?? validateEmailFeedback.default)
    this.feedbackCode = feedbackCode
    this.status = error.response?.status
  }
}
