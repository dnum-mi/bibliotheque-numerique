import axios from 'axios'

import { baseApiUrl, headers } from '@/api/api-client'
import { ChampType, TypeDeChampDS } from '@/shared/types'
import type { IDemarcheMappingColumn } from '../interfaces'

const DEMARCHE_BASE_URL = `${baseApiUrl}/demarches`
const IDENTIFICATIONS_INSTRUCTION_TIME = ['FE']

export async function updateConfigurations (idDemarche: string, demarcheMappingColumn: IDemarcheMappingColumn[]) {
  const chooseColumn = demarcheMappingColumn.filter(item => item.display)
  const updateAttribute = { mappingColumns: chooseColumn }

  const response = await axios({
    method: 'patch',
    url: `${DEMARCHE_BASE_URL}/${idDemarche}`,
    data: JSON.stringify(updateAttribute),
    headers,
  })
  return response.data
}

export async function getConfigurations (idDemarche: string, champDescriptors: any[], annotationDescriptors: any[]): Promise<IDemarcheMappingColumn[]> {
  let configurations: any[] | PromiseLike<IDemarcheMappingColumn[]> = []

  const response = await axios({
    method: 'get',
    url: `${DEMARCHE_BASE_URL}/${idDemarche}`,
    headers,
  })
  const mappingColumns = response.data.mappingColumns
  if (Array.isArray(mappingColumns)) configurations = mappingColumns

  const defaultConfigurations = (toDemarcheConfigurations(champDescriptors, ChampType.CHAMP)).concat(toDemarcheConfigurations(annotationDescriptors, ChampType.ANNOTATION))

  const identification = response.data.identification
  const isInstructionTime = hasInstructionTime(identification)
  if (isInstructionTime) {
    defaultConfigurations.push(...instructionTimeConfigurations(idDemarche))
  }

  if (configurations.length !== 0) {
    configurations.map((objet) => {
      return replaceInArray(objet, defaultConfigurations)
    })
  }
  configurations = defaultConfigurations
  return configurations
}

function hasInstructionTime (identification: string) {
  return IDENTIFICATIONS_INSTRUCTION_TIME.includes(identification)
}

function replaceInArray (objet: IDemarcheMappingColumn, listObjet: any[]) {
  const index = listObjet.findIndex(item => item.id === objet.id)
  if (index !== -1) {
    listObjet.splice(index, 1, objet)
  }
}

function toDemarcheConfigurations (datas: any[], typeData: string, parentLabel: string | null = null): IDemarcheMappingColumn[] {
  let returnArray: IDemarcheMappingColumn[] = []
  datas.forEach(objet => {
    returnArray.push(hashConfiguration(objet, typeData, parentLabel))
    if (objet.type === TypeDeChampDS.REPETITION) {
      returnArray = returnArray.concat(toDemarcheConfigurations(objet.champDescriptors, typeData, objet.label))
    }
  })
  return returnArray
}

function hashConfiguration (objet: any, typeData: string, parentLabel: string | null) {
  const labelSource = parentLabel ? [parentLabel, objet.label] : [objet.label]
  return demarcheMappingColumnBase(objet.id, labelSource, objet.type, typeData, objet.display)
}

function instructionTimeConfigurations (idDemarche: string) {
  return [
    demarcheMappingColumnBase(btoa(`TEMPSRESTANT${idDemarche}`), ['Temps restant'], '', ChampType.INSTRUCTION_TIME, false),
    demarcheMappingColumnBase(btoa(`ETATDELAI${idDemarche}`), ['État délai'], '', ChampType.INSTRUCTION_TIME, false),
  ]
}

function demarcheMappingColumnBase (id: string, labelSource: any[], typeName: string, typeData: string, display: boolean) {
  return {
    id,
    labelSource,
    labelBN: '',
    typeName,
    typeData,
    typeValue: '',
    display,
  }
}
