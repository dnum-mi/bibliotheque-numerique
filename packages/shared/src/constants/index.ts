export const dossierStates = {
  EnConstruction: 'en_construction',
  EnInstruction: 'en_instruction',
  Accepte: 'accepte',
  Refuse: 'refuse',
  SansSuite: 'sans_suite',
} as const

export type DossierState = typeof dossierStates[keyof typeof dossierStates]
