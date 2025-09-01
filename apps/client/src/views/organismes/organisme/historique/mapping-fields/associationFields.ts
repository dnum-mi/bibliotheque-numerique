import { dateToStringFr } from '@/utils'
import type { ISiafRnaOutput } from '@biblio-num/shared'
import type { HistoryMappingField } from '../types/historyMapping.type'

export const associationFields: HistoryMappingField<ISiafRnaOutput>[] = [
  { type: 'header', label: 'Informations Générales' },
  { type: 'field', key: 'id', label: 'Numéro RNA', accessor: (v: ISiafRnaOutput) => v.id },
  { type: 'field', key: 'title', label: 'Nom de l’association', accessor: (v: ISiafRnaOutput) => v.title },
  { type: 'field', key: 'titles', label: 'Autres noms', accessor: (v: ISiafRnaOutput) => v.titles?.join(', ') },
  { type: 'field', key: 'object', label: 'Objet social', accessor: (v: ISiafRnaOutput) => v.objetSocial.description },
  { type: 'field', key: 'nature', label: 'Nature juridique', accessor: (v: ISiafRnaOutput) => v.nature },
  { type: 'field', key: 'siret', label: 'N° SIRET', accessor: (v: ISiafRnaOutput) => v.siret },
  {
    type: 'field',
    key: 'dissolvedAt',
    label: 'Date de dissolution',
    accessor: (v: ISiafRnaOutput) => dateToStringFr(v.dissolved?.dissolvedAt),
  },
  { type: 'field', key: 'groupementType', label: 'Type de groupement', accessor: (v: ISiafRnaOutput) => v.groupement?.type },

  { type: 'header', label: 'Contact' },
  { type: 'field', key: 'email', label: 'Courriel', accessor: (v: ISiafRnaOutput) => v.emails?.[0] },
  { type: 'field', key: 'phone', label: 'Téléphone', accessor: (v: ISiafRnaOutput) => v.phones?.[0] },
  { type: 'field', key: 'website', label: 'Site web', accessor: (v: ISiafRnaOutput) => v.websites?.[0] },
  {
    type: 'field',
    key: 'gouvAddress',
    label: 'Adresse vérifiée',
    accessor: (v: ISiafRnaOutput) => v.addresses?.[0]?.gouvAddress?.label,
  },
  { type: 'header', label: 'Adresse du siège social' },
  {
    type: 'field',
    key: 'gouvAddress',
    label: 'Adresse vérifiée',
    accessor: (v: ISiafRnaOutput) => v.addresses?.[1]?.gouvAddress?.label,
  },
]
