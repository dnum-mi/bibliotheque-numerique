import axios from 'axios'
import { baseApiUrl, headers } from '@/utils/api-client'

export async function fetchOrganimseById (id: number): Promise<any | null> {
  try {
    const config = {
      method: 'get',
      url: `${baseApiUrl}/organismes/${id}/detail`,
      headers,
    }

    const response = await axios(config)
    return response.data
  } catch (error) {
    console.log(error)
  }
}

// Bouchon
export async function fetchOrganimseByIdRNA (id: string): Promise<any | null> {
  try {
    const config = {
      method: 'get',
      url: `${baseApiUrl}/organismes-datas/rna/${id}`,
      headers,
    }
    const response = await axios(config)
    const data = response.data
    if (data.organismesSource === 'API_RNA_V1') {
      const dataJson = {
        rna_id: data.dataJson.id_association,
        titre: data.dataJson.titre,
        objet: data.dataJson.objet,
        siret: data.dataJson.siret,
        siret_siege_social: '',
        date_creation: data.dataJson.date_creation,
        date_declaration: data.dataJson.date_derniere_declaration,
        date_publication: data.dataJson.date_publication_creation,
        date_dissolution: data.dataJson.date_declaration_dissolution,
        adresse_siege: {
          complement: '',
          numero_voie: data.dataJson.adresse_numero_voie,
          type_voie: data.dataJson.adresse_type_voie,
          libelle_voie: data.dataJson.adresse_libelle_voie,
          distribution: data.dataJson.adresse_distribution,
          code_insee: data.dataJson.adresse_code_insee,
          code_postal: data.dataJson.adresse_code_postal,
          commune: data.dataJson.adresse_libelle_commune,
        },
        etat: true,
        groupement: null,
        mise_a_jour: data.dataJson.derniere_maj,
      }
      data.dataJson = dataJson
    }
    // return data
    return response.data
  } catch (error) {
    console.log(error)
  }
}
