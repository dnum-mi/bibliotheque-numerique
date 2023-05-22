import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient } from '@/utils/api-client'
import { getConfigurations, updateConfigurations } from '@/shared/services'

import { toHeaderList, toRowData } from '@/shared/services/toHeaderList'
import { booleanToYesNo } from '@/utils/booleanToString'
import { stateToFr } from '@/utils/stateToString'
import { dateToStringFr } from '@/utils/dateToString'
import type { IDemarcheMappingColumn } from '@/shared/interfaces'
import type { TypeHeaderDataTable } from '@/shared/types/typeDataTable'
import { ChampValueTypesKeys, ChampType } from '@/shared/types'
import { fetchInstructionTimeByDossiers } from '@/shared/services/instructionTimes.service'
import { EInstructionTimeState, keyInstructionTime } from '../shared/types/instructionTime.type'

const headerDossierIdDefault: TypeHeaderDataTable[] = [
  {
    value: 'idBiblioNum',
    type: 'hidden',
  },
  {
    text: 'Numéro',
    value: 'number',
    type: 'number',
  },
]

const headerDossierDefault: TypeHeaderDataTable[] = [
  {
    text: 'Archivé',
    value: 'archived',
    parseFn: booleanToYesNo,
    type: 'boolean',
  },
  {
    text: 'Etat',
    value: 'state',
    parseFn: stateToFr,
    type: 'StateDS',
  },
  {
    text: 'Date de dépot',
    value: 'dateDepot',
    parseFn: dateToStringFr,
    type: 'date',
  },
  {
    text: 'Date de construction',
    value: 'datePassageEnConstruction',
    parseFn: dateToStringFr,
    type: 'date',
  },
  {
    text: "Date d'instruction",
    value: 'datePassageEnInstruction',
    parseFn: dateToStringFr,
    type: 'date',
  },
  {
    text: 'Date de traitement',
    value: 'dateTraitement',
    parseFn: dateToStringFr,
    type: 'date',
  },
  {
    text: 'Association déclarée cultuelle dans télédéclaration loi CRPR ?',
    value: 'annotations',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parseFn: (value:any) => {
      return value ? value[0]?.stringValue : ''
    },
  },
  {
    text: 'Si oui, date d\'entrée en vigueur de la qualité cultuelle',
    value: 'annotations',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parseFn: (value:any) => {
      return value ? value[0]?.stringValue : ''
    },
  },
]

const typeToParserFn = {
  [ChampValueTypesKeys.DATE]: dateToStringFr,
  boolean: booleanToYesNo,
  StateDS: stateToFr,
}
const getParserFnByType = (type) => {
  return typeToParserFn[type]
}

export const useDemarcheStore = defineStore('demarche', () => {
  let mappingColumn: IDemarcheMappingColumn[]
  const demarche = ref({})
  const hearderListDossier = ref<TypeHeaderDataTable[]>([])
  const rowDatasDossiers = ref<object[]>([])
  const dossiers = ref([])
  const instructionTimes = ref({})

  const getDemarche = async (idDemarche: number) => {
    if (!idDemarche) {
      console.log('idDemarche doit être saisie')
      return
    }
    const result = await apiClient.getDemarche(idDemarche)
    if (result) demarche.value = result
  }

  const getDemarcheByDsId = async (idDemarcheDS: number) => {
    if (!idDemarcheDS) {
      console.error('idDemarcheDS doit être saisie')
      return
    }
    const result = await apiClient.getDemarcheByDsId(idDemarcheDS)
    if (result) demarche.value = result
  }

  const demarches = ref([])
  const getDemarches = async () => {
    const result = await apiClient.getDemarches()

    if (result) {
      demarches.value = result.map((demarche: any) => {
        demarche.typeOrganisme = demarche?.typeOrganisme || ''
        return demarche
      })
    }
  }

  const getDossiers = async (idDemarche: number) => {
    if (!idDemarche) {
      console.log('idDemarche doit être saisie')
    }
    const results = await apiClient.getDossiersFromDemarche(idDemarche)
    if (results) dossiers.value = results
  }

  const demarcheConfigurations = ref<IDemarcheMappingColumn[]>([])
  const getDemarcheConfigurations = async () => {
    const champDescriptors = demarche.value?.demarcheDS?.dataJson.publishedRevision?.champDescriptors
    const annotationDescriptors = demarche.value?.demarcheDS?.dataJson.publishedRevision?.annotationDescriptors

    demarcheConfigurations.value = await getConfigurations(demarche.value.id, champDescriptors, annotationDescriptors) as any
  }

  const updateDemarcheConfigurations = async (configurationsForm: []) => {
    await updateConfigurations(demarche.value.id, configurationsForm.value)
    await getDemarcheConfigurations()
  }

  const isDemarcheWithInstructionTime = () => {
    return demarche.value && demarche.value.identification === 'FE'
  }

  const loadHeaderDossiers = async () => {
    mappingColumn = demarche.value?.mappingColumns || []
    // TODO: A revoir pour la preview
    // demarcheConfigurations.value.filter((mapping: IDemarcheMappingColumn) => mapping.display === true) || []

    const headerMapping = toHeaderList(mappingColumn).map(header => {
      const parseFn = getParserFnByType(header.type)
      if (parseFn) {
        return {
          ...header,
          parseFn,
        }
      }
      return header
    })

    hearderListDossier.value = [...headerDossierIdDefault, ...headerMapping, ...headerDossierDefault]
  }

  const loadRowDatas = async () => {
    rowDatasDossiers.value = dossiers.value?.map(data => {
      const { dossierDS, id } = data
      const { dataJson, id: idDs } = dossierDS || {}

      const jsonForRowData = dataJson && isDemarcheWithInstructionTime()
        ? {
            ...dataJson,
            [ChampType.INSTRUCTION_TIME]: instructionTimes.value[id],
          }
        : dataJson

      const rowDatasFromMapping = toRowData(jsonForRowData, mappingColumn)
      const row = rowDatasFromMapping.map(rowData => ({
        idBiblioNum: id,
        ...dataJson,
        ...rowData,
      }))

      return row
    }).flat()
  }

  const translateEtatDelai = {
    [EInstructionTimeState.FIRST_REQUEST]: '1ere demande',
    [EInstructionTimeState.IN_PROGRESS]: 'Instruction',
    [EInstructionTimeState.OUT_OF_DATE]: 'Délai expiré',
    [EInstructionTimeState.IN_EXTENSION]: 'Proroger',
    [EInstructionTimeState.SECOND_REQUEST]: '2eme demande',
    [EInstructionTimeState.SECOND_RECEIPT]: '2eme demande',
    [EInstructionTimeState.INTENT_OPPO]: "Intention d'opposition",
    [EInstructionTimeState.IN_ERROR]: 'Erreur',
  }

  const loadInstructionTimes = async () => {
    // TODO: A voir du besoin d'une condition coté front ou back
    if (isDemarcheWithInstructionTime()) {
      const instructionTimesFound = await fetchInstructionTimeByDossiers(dossiers.value.map(dossier => dossier.id))
      // TODO: A refaire avec des types pour ag-grid
      const instructionTimesTranslated = {}
      for (const idDossier in instructionTimesFound) {
        const instructionTime = instructionTimesFound[idDossier]
        const etatDelai = translateEtatDelai[instructionTime[keyInstructionTime.ETAT_DELAI]] || ''

        instructionTimesTranslated[idDossier] = {
          ...instructionTime,
          [keyInstructionTime.ETAT_DELAI]: etatDelai,
        }
      }
      instructionTimes.value = instructionTimesTranslated
    }
  }

  return {
    demarche,
    getDemarche,
    getDemarcheByDsId,
    demarches,
    getDemarches,
    dossiers,
    getDossiers,
    demarcheConfigurations,
    getDemarcheConfigurations,
    updateDemarcheConfigurations,
    loadHeaderDossiers,
    hearderListDossier,
    rowDatasDossiers,
    loadRowDatas,
    loadInstructionTimes,
    instructionTimes,
  }
})
