import { baseApiUrl, headers } from '../../utils/api-client'
import axios from 'axios'
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
