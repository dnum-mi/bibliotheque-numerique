import { createEnum } from '../factories'

export const states = ['queued', 'uploading', 'uploaded', 'failed'] as const

export type StateKey = (typeof states)[number]

export const eState = createEnum(states)
