import { foundationRoute, urlDSRoute } from './routes'

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
    let text
    if(res.headers.get('Content-Type')?.includes('application/json')){
      const json = await res.json()
      text = json.message
    } else {
      text = await res.text()
    }

    if (res.status === 403) {
      throw new Error("Soit votre dossier n'est pas au statut \"en instruction\" soit l'adresse mail est erronée.")
    }
    if (res.status === 424) {
      throw new Error('Ce dossier ne semble pas exister ou bien ne pas correspondre à une création')
    }
    if (res.status === 400) {

      switch(text) {
        case 'Department is required.':
          throw new Error('Le département est manquant ou erroné.')
        case 'FRUP: orginal created date is requied':
          throw new Error('Donnée manquante: La date de publication pour les FRUP.')
        case 'orginal created date is requied':
          throw new Error('Donnée manquante: La date de la décision pour un FDD ou une FE')
        default:
          throw new Error('La démarche associé à ce dossier ne permet pas de créer un identifiant RNF')
      }
    }


    throw new Error( text || "Une Erreur inconnue s'est produite, Veuillez contacter l'administrateur")
  }
  return res
}


async function fetchUrlDS(): Promise<string> {
  const res = await fetch(urlDSRoute, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(await res.text())
  }

  const json = await res.json()
  return json.url;
}

export {
  fetchRnfId,
  fetchUrlDS,
}
