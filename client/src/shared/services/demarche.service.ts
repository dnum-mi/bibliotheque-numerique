import type { IDemarcheMappingColumn } from '../interfaces'
import { baseApiUrl, headers } from '../../utils/api-client'
import axios from 'axios'
import { ChampType } from '@/shared/types'

const DEMARCHE_BASE_URL = `${baseApiUrl}/demarches`
const DEMARCHE_CONFIG_URL = `${DEMARCHE_BASE_URL}/configurations`

export async function updateConfigurations (demarcheMappingColumn: IDemarcheMappingColumn[], idDemarche: string) {
  const chooseColumn = demarcheMappingColumn.filter(item => item.display)

  try {
    const response = await axios({
      method: 'PATCH',
      url: DEMARCHE_CONFIG_URL + '/' + idDemarche,
      data: JSON.stringify(chooseColumn),
      headers,
    })
    return response.data
  } catch (error) {
    throw await error
  }
}

export async function getConfigurations (champDescriptors: any[], annotationDescriptors: any[]): Promise<IDemarcheMappingColumn[]> {
  let configurations: any[] | PromiseLike<IDemarcheMappingColumn[]> = []
  // try {
  //   const response = await axios({
  //     method: 'get',
  //     url: DEMARCHE_CONFIG_URL,
  //     headers,
  //   })
  //   configurations = response.data
  // } catch (error) {
  //   throw await error
  // }
  if (configurations.length === 0) {
    configurations = (toDemarcheConfigurations(champDescriptors, ChampType.CHAMP)).concat(toDemarcheConfigurations(annotationDescriptors, ChampType.ANNOTATION))
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
