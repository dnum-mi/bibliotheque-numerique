import { createEnum } from 'factories'

const passwordRequestsDecision = ['APPROVE', 'REJECT'] as const

export type PasswordRequestsDecisionKey = (typeof passwordRequestsDecision)[number]
export const ePasswordRequestsDecision = createEnum(passwordRequestsDecision)
