import type { ISiafRnfOutput } from '@biblio-num/shared'
import { dateToStringFr } from '@/utils'
import type { HistoryMappingField } from '../types/historyMapping.type'

export const foundationFields: HistoryMappingField<ISiafRnfOutput>[] = [
  {
    type: 'header',
    label: 'Informations Générales',
  },
  {
    type: 'field',
    key: 'id',
    label: 'Numéro RNF',
    accessor: (v: ISiafRnfOutput) => v.id,
  },
  {
    type: 'field',
    key: 'foundationType',
    label: 'Type de fondation',
    accessor: (v: ISiafRnfOutput) => v.foundationType,
  },
  {
    type: 'field',
    key: 'title',
    label: 'Nom de la fondation',
    accessor: (v: ISiafRnfOutput) => v.title,
  },
  {
    type: 'field',
    key: 'email',
    label: 'Courriel',
    accessor: (v: ISiafRnfOutput) => v.email,
  },
  {
    type: 'field',
    key: 'phone',
    label: 'Téléphone',
    accessor: (v: ISiafRnfOutput) => v.phone,
  },
  {
    type: 'field',
    key: 'department',
    label: 'Département de rattachement d’origine',
    accessor: (v: ISiafRnfOutput) => v.department,
  },
  {
    type: 'field',
    key: 'originalDepartment',
    label: 'Département d\'origine',
    accessor: (v: ISiafRnfOutput) => v.originalDepartment,
  },
  {
    type: 'field',
    key: 'generalInterest',
    label: 'Caractère de l\'activité d\'intérêt général',
    accessor: (v: ISiafRnfOutput) => v.generalInterest,
  },
  {
    type: 'field',
    key: 'objectDescription',
    label: 'Objet social',
    accessor: (v: ISiafRnfOutput) => v.objectDescription,
  },
  {
    type: 'field',
    key: 'websites',
    label: 'Site web',
    accessor: (v: ISiafRnfOutput) => v.websites?.join(', '),
  },
  {
    type: 'field',
    key: 'createdAt',
    label: 'Date de création dans SIAF RNF',
    accessor: (v: ISiafRnfOutput) => dateToStringFr(v.createdAt),
  },
  {
    type: 'field',
    key: 'originalCreatedAt',
    label: 'Date de création',
    accessor: (v: ISiafRnfOutput) => dateToStringFr(v.originalCreatedAt),
  },
  {
    type: 'field',
    key: 'addressDsStringValue',
    label: 'Siège social',
    accessor: (v: ISiafRnfOutput) => v.address?.gouvAddress?.label,
  },
  {
    type: 'header',
    label: 'Dépôt des comptes',
  },
  {
    type: 'field',
    key: 'fiscalEndDateAt',
    label: 'Date de clôture des comptes',
    accessor: (v: ISiafRnfOutput) => dateToStringFr(v.fiscalEndDateAt),
  },
  {
    type: 'field',
    key: 'declarationYears',
    label: 'Années déclarées',
    accessor: (v: ISiafRnfOutput) => v.declarationYears?.join(', '),
  },
  {
    type: 'field',
    key: 'internationalAction',
    label: 'Activité à l’international',
    accessor: (v: ISiafRnfOutput) => (v.internationalAction ? 'Oui' : 'Non'),
  },
]
