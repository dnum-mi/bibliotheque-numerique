interface IRnaAddress {
  complement: string | null
  numero_voie: string | null
  type_voie: string | null
  libelle_voie: string | null
  distribution: string | null
  code_insee: string | null
  code_postal: string | null
  commune: string | null
}

// RNA return more information, but we keep only what we need
export interface IRnaOutput {
  rna: string
  ancien_id: string | null
  siren: string | null
  nom: string
  sigle: string
  forme_juridique: {
    code: string | null
    libelle: string | null
  }
  regime: string | null
  groupement: string | null
  date_dissolution: string | null
  adresse_siege: IRnaAddress | null
  siret_siege: IRnaAddress | null
  date_creation: string | null
  reconnue_utilite_publique: boolean
}
