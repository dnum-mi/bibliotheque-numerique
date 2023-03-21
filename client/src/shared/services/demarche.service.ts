import axios from 'axios'

import { baseApiUrl, headers } from '../../utils/api-client'
import { ChampType } from '@/shared/types'
import type { IDemarcheMappingColumn } from '../interfaces'

const DEMARCHE_BASE_URL = `${baseApiUrl}/demarches`

export async function updateConfigurations (idDemarche: string, demarcheMappingColumn: IDemarcheMappingColumn[]) {
  const chooseColumn = demarcheMappingColumn.filter(item => item.display)
  const updateAttribute = { mappingColumns: chooseColumn }

  try {
    const response = await axios({
      method: 'patch',
      url: `${DEMARCHE_BASE_URL}/${idDemarche}`,
      data: JSON.stringify(updateAttribute),
      headers,
    })
    return response.data
  } catch (error) {
    throw await error
  }
}

export async function getConfigurations (idDemarche: string, champDescriptors: any[], annotationDescriptors: any[]): Promise<IDemarcheMappingColumn[]> {
  let configurations: any[] | PromiseLike<IDemarcheMappingColumn[]> = []

  try {
    const response = await axios({
      method: 'get',
      url: `${DEMARCHE_BASE_URL}/${idDemarche}`,
      headers,
    })
    const mappingColumns = response.data.mappingColumns
    if (Array.isArray(mappingColumns)) configurations = mappingColumns
  } catch (error) {
    throw await error
  }

  const defaultConfigurations = (toDemarcheConfigurations(champDescriptors, ChampType.CHAMP)).concat(toDemarcheConfigurations(annotationDescriptors, ChampType.ANNOTATION))
  if (configurations.length !== 0) {
    configurations.map((objet) => {
      return replaceInArray(objet, defaultConfigurations)
    })
  }
  configurations = defaultConfigurations
  return configurations
}

function replaceInArray (objet: IDemarcheMappingColumn, listObjet: any[]) {
  const index = listObjet.findIndex(item => item.id === objet.id)
  if (index !== -1) {
    listObjet.splice(index, 1, objet)
  }
}

function toDemarcheConfigurations (datas: any[], typeData: string): IDemarcheMappingColumn[] {
  return datas.map((objet) => {
    return {
      id: objet.id,
      labelSource: objet.label,
      labelBN: '',
      typeName: objet.type,
      typeData,
      typeValue: '',
      display: objet.display,
    }
  })
}

const mappinBouchon: IDemarcheMappingColonne[] = [
  {
    id: 'Q2hhbXAtMTE6',
    labelSource: ["Quel est l'organisme bénéficiaire de la déclaration ?"],
    labelBN: "Quel est l'organisme bénéficiaire de la déclaration ?",
    typeName: '',
    typeData: 'champ',
    typeValue: 'Text',
  },
  {
    id: 'Q2hhbXAtMTE7',
    labelSource: ["Titre de l'association"],
    labelBN: "Titre de l'association",
    typeName: '',
    typeData: 'champ',
    typeValue: 'Text',
  },
  {
    id: 'Q2hhbXAtMTE7',
    labelSource: ['Adresse du siège social'],
    labelBN: 'Adresse du siège social',
    typeName: '',
    typeData: 'champ',
    typeValue: 'Text',
  },
]
// TODO: A supprimer Bouchon
export function fetchMappingColumnDossiers () {
  // TODO: Bouchon
  const mappingColumn = [
    // {
    //   id: 'Q2hhbXAtMTE5',
    //   labelSource: ['state'],
    //   labelBN: 'Déclaration initiale de création',
    //   typeName: 'etat',
    //   typeData: 'champ',
    //   typeValue: 'Text',
    // },
    {
      id: 'Q2hhbXAtMTE6',
      labelSource: ['Déclaration initiale de création'],
      labelBN: 'Déclaration initiale de création',
      typeName: '',
      typeData: 'champ',
      typeValue: 'Text',
    },
    {
      id: 'Q2hhbXAtMTE7',
      labelSource: ['Autorité ayant délivré le récépissé de déclaration de création du fonds de dotation'],
      labelBN: 'Préfecture',
      typeName: '',
      typeData: 'champ',
      typeValue: 'Text',
    },
    {
      id: 'Q2hhbXAtMTE8',
      labelSource: ['Date du récépissé actant la création du fonds de dotation'],
      labelBN: 'Date création',
      typeName: '',
      typeData: 'champ',
      typeValue: 'Text', // Date
    },
    {
      id: 'Q2hhbXAtMTE9',
      labelSource: ['Nature des modifications statutaires'],
      labelBN: 'Modifications statutaires',
      typeName: '',
      typeData: 'champ',
      typeValue: 'Text', // Array
    },
    {
      id: 'Q2hhbXAtMTEA',
      labelSource: ["Membres du conseil d'administration du fonds de dotation"],
      labelBN: 'Membres',
      typeName: '',
      typeData: 'champ',
      typeValue: 'file',
    },
    {
      id: 'Q2hhbXAtMTEB',
      labelSource: ['Adresse du siège social du fonds de dotation'],
      labelBN: 'Adresse',
      typeName: '',
      typeData: 'champ',
      typeValue: 'Text', // Adresse
    },
    {
      id: 'Q2hhbXAtMTEC',
      labelSource: ['Ancien titre du fonds de dotation'],
      labelBN: 'Ancien titre',
      typeName: '',
      typeData: 'champ',
      typeValue: 'Text', // Adresse
    },
    {
      id: '',
      labelSource: ["N° unique de l'organisme"],
      labelBN: "N° unique de l'organisme",
      typeName: '',
      typeData: 'annotation',
      typeValue: 'Text', // Adresse
    },
  ]

  return mappingColumn
}

// export const fetchDosseirsRowData = async (idDemarche) => {
//   try {
//     const config = {
//       method: 'get',
//       url: `${baseApiUrl}/demarches/${idDemarche}/dossiers`,
//       headers,
//     }
//     const response = await axios(config)

//     return response.data.map(data => ({
//         ...data,
//         ...toRowData(data.dossierDS?.dataJson, mappingColumn)})
//   } catch (error) {
//     console.log(error)
//   }
// }
