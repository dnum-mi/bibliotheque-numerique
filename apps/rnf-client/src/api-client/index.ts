import { foundationRoute } from './routes'

async function fetchRnfId(dossierId: number, instructeurEmail: string, force: boolean) {
  const res = await fetch(foundationRoute, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      dossierId,
      email: instructeurEmail,
      forceCreate: force,
    }),
  })
  if (!res.ok && res.status !== 409) {
    const errorBody = await res.json().catch(() => res.text())
    if (errorBody.statusCode === 403) {
      throw new Error("Cette adresse courriel ne semble pas être l'email d'un instructeur de ce dossier.")
    }
    if (errorBody.statusCode === 424) {
      throw new Error('Ce dossier ne semble pas exister ou bien ne pas correspondre à une création')
    }
    if (errorBody.statusCode === 400) {
      throw new Error('La démarche associé à ce dossier ne permet pas de créer un identifiant RNF')
    }
    throw new Error(await res.text())
  }
  return res
}

export { fetchRnfId }
