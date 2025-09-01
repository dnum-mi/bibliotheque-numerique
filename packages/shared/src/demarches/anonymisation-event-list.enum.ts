import { createEnum } from '../factories'

export const anonymisationEvents = ['DepotDate', 'DecisionDate', 'AcceptedDate'] as const

export type anonymisationEventKey = (typeof anonymisationEvents)[number]

export const eAnonymisationEvent = createEnum(anonymisationEvents)
