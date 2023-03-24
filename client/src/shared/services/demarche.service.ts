import { baseApiUrl, headers } from '../../utils/api-client'
import axios from 'axios'
import { ChampType } from '@/shared/types'
import type { IDemarcheMappingColumn } from '../interfaces'

const DEMARCHE_BASE_URL = `${baseApiUrl}/demarches`

export async function updateConfigurations (demarcheMappingColumn: IDemarcheMappingColumn[], idDemarche: string) {
  const chooseColumn = demarcheMappingColumn.filter(item => item.display)

  try {
    const response = await axios({
      method: 'PUT',
      url: DEMARCHE_BASE_URL + '/' + idDemarche + '/update-mapping',
      data: JSON.stringify(chooseColumn),
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
      url: DEMARCHE_BASE_URL + '/' + idDemarche,
      headers,
    })
    const mappingColumns = response.data.mappingColumns
    if (Array.isArray(mappingColumns)) configurations = mappingColumns
  } catch (error) {
    throw await error
  }

  if (configurations.length === 0) {
    configurations = (toDemarcheConfigurations(champDescriptors, ChampType.CHAMP)).concat(toDemarcheConfigurations(annotationDescriptors, ChampType.ANNOTATION))
  } else {
    // TODO: when server return value, fusion value return and list in store.
  }

  return configurations
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
