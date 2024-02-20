const states = ['queued', 'uploading', 'uploaded', 'failed']

export type StateKey = (typeof states)[number]

export const eState = Object.fromEntries(states.map(s => [s, s])) as Record<
  StateKey,
  StateKey
>
