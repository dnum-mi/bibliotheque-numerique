import {
  eFieldCode,
  FieldCodeKey,
  FileFieldCodeKey,
} from '@/modules/dossiers/objects/constante/field-code.enum'
import { eFileTag, FileTagKey } from '@biblio-num/shared'
import { Field } from '@/modules/dossiers/objects/entities/field.entity'
import { Dossier as TDossier } from '@dnum-mi/ds-api-client'
import * as dayjs from 'dayjs'

type TagAndLabelFactory = {
  tag: FileTagKey
  labelFactory: (
    targetField: Field,
    fieldCodeHash?: Record<FieldCodeKey, Field>[],
    jsonDossier?: TDossier,
  ) => string
}

const formatDate = (date: Date): string => {
  return dayjs(date?.toISOString()).format('DD.MM.YYYY')
}

const commonFileWithDateLabelFactory = (
  fh: Record<FieldCodeKey, Field>[],
  dateCode: FieldCodeKey,
  suffix: string,
): string => {
  let date: Date
  if (fh[dateCode]) {
    date = fh[dateCode].dateValue
  } else {
    date = new Date(0)
  }
  return `${formatDate(date)}_${suffix}`
}

const commonFileWithYearLabelFactory = (
  fh: Record<FieldCodeKey, Field>[],
  dateCode: FieldCodeKey,
  suffix: string,
): string => {
  let year: number
  if (eFieldCode[dateCode] && fh[dateCode]) {
    year = fh[dateCode].numberValue ?? parseInt(fh[dateCode].stringValue)
  } else {
    year = 1970
  }
  return `${year}_${suffix}`
}

export const dCodeToLabelsAndTag: Record<FileFieldCodeKey, TagAndLabelFactory> =
  {
    'file-fe-excel': {
      tag: eFileTag.fe,
      labelFactory: (f, fh, d) => {
        const date = formatDate(d.dateTraitement)
        return `${date}_Déclaration financement étranger`
      },
    },
    'file-initial-status': {
      tag: eFileTag.status,
      labelFactory: (f, fh, d) => {
        const date = formatDate(d.dateTraitement)
        return `${date}_Statuts initiaux`
      },
    },
    'file-extended-status': {
      tag: eFileTag.status,
      labelFactory: (f, fh, d) => {
        const date = formatDate(d.dateTraitement)
        return `${date}_Statuts prorogés`
      },
    },
    'file-extended-pv': {
      tag: eFileTag.pv,
      labelFactory: (f, fh) => {
        return commonFileWithDateLabelFactory(
          fh,
          eFieldCode['board-decision-at'],
          'PV prorogation',
        )
      },
    },
    'file-updated-status': {
      tag: eFileTag.status,
      labelFactory: (f, fh) => {
        return commonFileWithDateLabelFactory(
          fh,
          eFieldCode['updated-status-at'],
          'Statuts modifiés',
        )
      },
    },
    'file-status-update-pv': {
      tag: eFileTag.pv,
      labelFactory: (f, fh) => {
        return commonFileWithDateLabelFactory(
          fh,
          eFieldCode['updated-status-at'],
          'PV modification statutaire',
        )
      },
    },
    'file-dissolution-pv': {
      tag: eFileTag.pv,
      labelFactory: (f, fh) => {
        return commonFileWithDateLabelFactory(
          fh,
          eFieldCode['dissolution-at'],
          'PV dissolution',
        )
      },
    },
    'file-dissolution-judgment': {
      tag: eFileTag.judgment,
      labelFactory: (f, fh) => {
        return commonFileWithDateLabelFactory(
          fh,
          eFieldCode['dissolution-at'],
          'Jugement dissolution',
        )
      },
    },
    'file-certified-account': {
      tag: eFileTag.account,
      labelFactory: (f, fh) => {
        return commonFileWithYearLabelFactory(
          fh,
          eFieldCode['account-year'],
          'États financiers certifiés',
        )
      },
    },
    'file-public-ressources-account': {
      tag: eFileTag.account,
      labelFactory: (f, fh) => {
        return commonFileWithYearLabelFactory(
          fh,
          eFieldCode['account-year'],
          'Compte d\'emploi des ressources collectées auprès du public',
        )
      },
    },
    'file-budget-account': {
      tag: eFileTag.account,
      labelFactory: (f, fh) => {
        return commonFileWithYearLabelFactory(
          fh,
          eFieldCode['account-year'],
          'Budget prévisionnel',
        )
      },
    },
    'file-abrited-account': {
      tag: eFileTag.account,
      labelFactory: (f, fh) => {
        return commonFileWithYearLabelFactory(
          fh,
          eFieldCode['account-year'],
          'Rapport fondation abritante',
        )
      },
    },
    'file-annual-report': {
      tag: eFileTag.activityReport,
      labelFactory: (f, fh) => {
        return commonFileWithYearLabelFactory(
          fh,
          eFieldCode['account-year'],
          'Rapport d\'activité',
        )
      },
    },
    'file-validated-account-pv': {
      tag: eFileTag.pv,
      labelFactory: (f, fh) => {
        return commonFileWithDateLabelFactory(
          fh,
          eFieldCode['validated-account-at'],
          'PV approbation comptes',
        )
      },
    },
    'file-financial-state-account': {
      tag: eFileTag.account,
      labelFactory: (f, fh) => {
        return commonFileWithYearLabelFactory(
          fh,
          eFieldCode['account-year'],
          'État financiers',
        )
      },
    },
    'file-certified-financial-state-account': {
      tag: eFileTag.account,
      labelFactory: (f, fh) => {
        return commonFileWithYearLabelFactory(
          fh,
          eFieldCode['account-year'],
          'État financiers certifiés',
        )
      },
    },
    'file-fe-account': {
      tag: eFileTag.account,
      labelFactory: (f, fh) => {
        return commonFileWithYearLabelFactory(
          fh,
          eFieldCode['account-year'],
          'Financements étrangers',
        )
      },
    },
  }
