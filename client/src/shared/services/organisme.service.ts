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
      // TODO: A remmettre
      url: `${baseApiUrl}/organismes-datas/rna/${id}`,
      // TODO: Bouchon de test
      // url: `https://entreprise.data.gouv.fr/api/rna/v1/id/${id}`,
      headers,
    }
    const response = await axios(config)

    // const asso = response.data.association
    // const data = {
    //   organismeData: {
    //     dataJson: {
    //       data: {
    //         rna_id: 'W751080001',
    //         titre: 'LA PRÉVENTION ROUTIERE',
    //         objet: 'Accroitre la sécurité des usagers en encourageant toutes mesures ou initiatives propres à réduire les accidents',
    //         siret: null,
    //         siret_siege_social: '77571979202650',
    //         date_creation: '1955-01-01',
    //         date_declaration: '1955-01-01',
    //         date_publication: null,
    //         date_dissolution: null,
    //         adresse_siege: {
    //           complement: '',
    //           numero_voie: '33',
    //           type_voie: 'rue',
    //           libelle_voie: 'de Modagor',
    //           distribution: 'string',
    //           code_insee: '75108',
    //           code_postal: '75009',
    //           commune: 'Paris',
    //         },
    //         etat: true,
    //         groupement: null,
    //         mise_a_jour: '1955-01-01',
    //       },
    //     },
    //   },
    // }

    // const data = {
    //   organismeData: {
    //     dataJson: {
    //       data: {
    //         rna_id: asso.id_association,
    //         titre: asso.titre,
    //         objet: asso.objet,
    //         siret: asso.siret,
    //         siret_siege_social: '',
    //         date_creation: asso.date_creation,
    //         date_declaration: asso.date_derniere_declaration,
    //         date_publication: asso.date_publication_creation,
    //         date_dissolution: asso.date_declaration_dissolution,
    //         adresse_siege: {
    //           complement: '',
    //           numero_voie: asso.adresse_numero_voie,
    //           type_voie: asso.adresse_type_voie,
    //           libelle_voie: asso.adresse_libelle_voie,
    //           distribution: asso.adresse_distribution,
    //           code_insee: asso.adresse_code_insee,
    //           code_postal: asso.adresse_code_postal,
    //           commune: asso.adresse_libelle_commune,
    //         },
    //         etat: true,
    //         groupement: null,
    //         mise_a_jour: asso.derniere_maj,
    //       },
    //     },
    //   },
    // }

    // return data
    return response.data
  } catch (error) {
    console.log(error)
  }
}
