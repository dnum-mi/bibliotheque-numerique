import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient } from '@/utils/api-client'
import { getConfigurations, updateConfigurations } from '@/shared/services'

import { toHeaderList, toRowData } from '../shared/services/toHeaderList'
import { mappinBouchon } from '../shared/services/demarche.service'
import { booleanToYesNo } from '../utils/booleanToString'
import { stateToFr } from '../utils/stateToString'
import { dateToStringFr } from '../utils/dateToString'
import type { IDemarcheMappingColonne } from '../shared/interfaces'
import type { TypeHeaderDataTable } from '../components/typeDataTable'
import { ChampValueTypesKeys } from '../shared/types'

const headerDossierDefault: TypeHeaderDataTable[] = [
  {
    value: 'idBiblioNum',
  },
  {
    text: 'Numéro',
    value: 'number',
  },
]

const headerDossierDefault1: TypeHeaderDataTable[] = [
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
  let mappingColumn: IDemarcheMappingColonne[]
  const demarche = ref({})
  const hearderListDossier = ref<TypeHeaderDataTable[]>([])
  const rowDatasDossiers = ref<object[]>([])
  const dossiers = ref([])

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

  const demarcheConfigurations = ref([])
  const getDemarcheConfigurations = async () => {
    const champDescriptors = demarche.value?.demarcheDS?.dataJson.publishedRevision?.champDescriptors
    const annotationDescriptors = demarche.value?.demarcheDS?.dataJson.publishedRevision?.annotationDescriptors

    demarcheConfigurations.value = await getConfigurations(demarche.value.id, champDescriptors, annotationDescriptors) as any
  }

  const updateDemarcheConfigurations = async (configurationsForm: []) => {
    await updateConfigurations(demarche.value.id, configurationsForm.value)
  }

  const loadHeaderDossiers = async (idDemarche: number) => {
    if (!idDemarche) {
      console.log('idDemarche doit être saisie')
    }
    // mappingColumn = await getConfigurations()
    mappingColumn = demarche.value?.mappingColumn || mappinBouchon

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
    console.log(headerMapping)
    hearderListDossier.value = [...headerDossierDefault, ...headerMapping, ...headerDossierDefault1]
  }

  const loadRowDatas = async () => {
    rowDatasDossiers.value = dossiers.value?.map(data => ({
      idBiblioNum: data.id,
      ...data.dossierDS?.dataJson,
      ...toRowData(data.dossierDS?.dataJson, mappingColumn),
    }))
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
  }
})
