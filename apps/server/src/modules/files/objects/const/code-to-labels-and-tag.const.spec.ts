import {
  eFileFieldCode,
  FieldCodeKey,
  FileFieldCodeKey,
  fileFieldCodes,
} from '@/modules/dossiers/objects/constante/field-code.enum'
import { dCodeToLabelsAndTag } from '@/modules/files/objects/const/code-to-labels-and-tag.const'
import { eFileTag } from '@biblio-num/shared'
import { Field } from '@/modules/dossiers/objects/entities/field.entity'
import { Dossier as TDossier } from '@dnum-mi/ds-api-client'

describe('Field code to label', () => {
  it('Every code should be implemented', () => {
    fileFieldCodes.forEach((code: FileFieldCodeKey) => {
      expect(dCodeToLabelsAndTag[code]).toBeDefined()
    })
  })

  it('Date should be 1970 if no date traitement', () => {
    const code = 'file-fe-excel'
    const tag = dCodeToLabelsAndTag[code].tag
    const labelFactory = dCodeToLabelsAndTag[code].labelFactory

    const label = labelFactory(
      {} as Record<FieldCodeKey, Field>,
      {  } as TDossier,
    )
    expect(tag).toEqual(eFileTag.fe)
    expect(label).toBe('01.01.1970_Déclaration financement étranger')
  })

  it('Date should be 1970 if no date champs', () => {
    const code = 'file-extended-pv'
    const labelFactory = dCodeToLabelsAndTag[code].labelFactory

    const label = labelFactory(
      {} as Record<FieldCodeKey, Field>,
      { } as TDossier,
    )
    expect(label).toBe('01.01.1970_PV prorogation')
  })

  it('Year should be 1970 if no year', () => {
    const code = 'file-extended-pv'
    const labelFactory = dCodeToLabelsAndTag[code].labelFactory

    const label = labelFactory(
      {} as Record<FieldCodeKey, Field>,
      { } as TDossier,
    )
    expect(label).toBe('01.01.1970_PV prorogation')
  })

  it('Code "file-fe-excel" should be correct', () => {
    const code = 'file-fe-excel'
    const tag = dCodeToLabelsAndTag[code].tag
    const labelFactory = dCodeToLabelsAndTag[code].labelFactory

    const label = labelFactory(
      {} as Record<FieldCodeKey, Field>,
      { dateTraitement: new Date('2021-01-01') } as TDossier,
    )
    expect(tag).toEqual(eFileTag.fe)
    expect(label).toBe('01.01.2021_Déclaration financement étranger')
  })

  it('Code "file-initial-status" should be correct', () => {
    const code = 'file-initial-status'
    const tag = dCodeToLabelsAndTag[code].tag
    const labelFactory = dCodeToLabelsAndTag[code].labelFactory

    const label = labelFactory(
      {} as Record<FieldCodeKey, Field>,
      { dateTraitement: new Date('2021-01-01') } as TDossier,
    )
    expect(tag).toEqual(eFileTag.status)
    expect(label).toBe('01.01.2021_Statuts initiaux')
  })

  it('Code "file-extended-status" should be correct', () => {
    const code = 'file-extended-status'
    const tag = dCodeToLabelsAndTag[code].tag
    const labelFactory = dCodeToLabelsAndTag[code].labelFactory

    const label = labelFactory(
      {} as Record<FieldCodeKey, Field>,
      { dateTraitement: new Date('2021-01-01') } as TDossier,
    )
    expect(tag).toEqual(eFileTag.status)
    expect(label).toBe('01.01.2021_Statuts prorogés')
  })

  it('Code "file-extended-pv" should be correct', () => {
    const code = 'file-abrited-account'
    const labelFactory = dCodeToLabelsAndTag[code].labelFactory

    const label = labelFactory({} as Record<FieldCodeKey, Field>)
    expect(label).toBe('1970_Rapport fondation abritante')
  })

  it('Code "file-updated-status" should be correct', () => {
    const code = 'file-updated-status'
    const tag = dCodeToLabelsAndTag[code].tag
    const labelFactory = dCodeToLabelsAndTag[code].labelFactory

    const label = labelFactory({
      ['updated-status-at']: { dateValue: new Date('2021-01-01') },
    } as Record<FieldCodeKey, Field>)
    expect(tag).toEqual(eFileTag.status)
    expect(label).toBe('01.01.2021_Statuts modifiés')
  })

  it('Code "file-status-update-pv" should be correct', () => {
    const code = 'file-status-update-pv'
    const tag = dCodeToLabelsAndTag[code].tag
    const labelFactory = dCodeToLabelsAndTag[code].labelFactory

    const label = labelFactory({
      ['updated-status-at']: { dateValue: new Date('2021-01-01') },
    } as Record<FieldCodeKey, Field>)
    expect(tag).toEqual(eFileTag.pv)
    expect(label).toBe('01.01.2021_PV modification statutaire')
  })

  it('Code "file-dissolution-pv" should be correct', () => {
    const code = 'file-dissolution-pv'
    const tag = dCodeToLabelsAndTag[code].tag
    const labelFactory = dCodeToLabelsAndTag[code].labelFactory

    const label = labelFactory({
      ['dissolution-at']: { dateValue: new Date('2021-01-01') },
    } as Record<FieldCodeKey, Field>)
    expect(tag).toEqual(eFileTag.pv)
    expect(label).toBe('01.01.2021_PV dissolution')
  })

   it('Code "file-dissolution-judgment" should be correct', () => {
    const code = 'file-dissolution-judgment'
    const tag = dCodeToLabelsAndTag[code].tag
    const labelFactory = dCodeToLabelsAndTag[code].labelFactory

    const label = labelFactory({
      ['dissolution-at']: { dateValue: new Date('2021-01-01') },
    } as Record<FieldCodeKey, Field>)
    expect(tag).toEqual(eFileTag.judgment)
    expect(label).toBe('01.01.2021_Jugement dissolution')
  })

  it('Code "file-certified-account" should be correct', () => {
    const code = 'file-certified-account'
    const tag = dCodeToLabelsAndTag[code].tag
    const labelFactory = dCodeToLabelsAndTag[code].labelFactory

    const label = labelFactory({
      ['account-year']: { numberValue: 2040 },
    } as Record<FieldCodeKey, Field>)
    expect(tag).toEqual(eFileTag.account)
    expect(label).toBe('2040_États financiers certifiés')
  })

  it('Code "file-public-ressources-account" should be correct', () => {
    const code = 'file-public-ressources-account'
    const tag = dCodeToLabelsAndTag[code].tag
    const labelFactory = dCodeToLabelsAndTag[code].labelFactory

    const label = labelFactory({
      ['account-year']: { numberValue: 2040 },
    } as Record<FieldCodeKey, Field>)
    expect(tag).toEqual(eFileTag.account)
    expect(label).toBe('2040_Compte d\'emploi des ressources collectées auprès du public')
  })

  it('Code "file-budget-account" should be correct', () => {
    const code = 'file-budget-account'
    const tag = dCodeToLabelsAndTag[code].tag
    const labelFactory = dCodeToLabelsAndTag[code].labelFactory

    const label = labelFactory({
      ['account-year']: { numberValue: 2040 },
    } as Record<FieldCodeKey, Field>)
    expect(tag).toEqual(eFileTag.account)
    expect(label).toBe('2040_Budget prévisionnel')
  })

  it('Code "file-abrited-account" should be correct', () => {
    const code = 'file-abrited-account'
    const tag = dCodeToLabelsAndTag[code].tag
    const labelFactory = dCodeToLabelsAndTag[code].labelFactory

    const label = labelFactory({
      ['account-year']: { numberValue: 2040 },
    } as Record<FieldCodeKey, Field>)
    expect(tag).toEqual(eFileTag.account)
    expect(label).toBe('2040_Rapport fondation abritante')
  })

  it('Code "file-annual-report" should be correct', () => {
    const code = 'file-annual-report'
    const tag = dCodeToLabelsAndTag[code].tag
    const labelFactory = dCodeToLabelsAndTag[code].labelFactory

    const label = labelFactory({
      ['account-year']: { numberValue: 2040 },
    } as Record<FieldCodeKey, Field>)
    expect(tag).toEqual(eFileTag.activityReport)
    expect(label).toBe('2040_Rapport d\'activité')
  })

  it('Code "file-validated-account-pv" should be correct', () => {
    const code = 'file-validated-account-pv'
    const tag = dCodeToLabelsAndTag[code].tag
    const labelFactory = dCodeToLabelsAndTag[code].labelFactory

    const label = labelFactory({
      ['validated-account-at']: { dateValue: new Date('2021-01-01') },
    } as Record<FieldCodeKey, Field>)
    expect(tag).toEqual(eFileTag.pv)
    expect(label).toBe('01.01.2021_PV approbation comptes')
  })

  it('Code "file-financial-state-account" should be correct', () => {
    const code = 'file-financial-state-account'
    const tag = dCodeToLabelsAndTag[code].tag
    const labelFactory = dCodeToLabelsAndTag[code].labelFactory

    const label = labelFactory({
      ['account-year']: { numberValue: 2040 },
    } as Record<FieldCodeKey, Field>)
    expect(tag).toEqual(eFileTag.account)
    expect(label).toBe('2040_État financiers')
  })

  it('Code "file-certified-financial-state-account" should be correct', () => {
    const code = 'file-certified-financial-state-account'
    const tag = dCodeToLabelsAndTag[code].tag
    const labelFactory = dCodeToLabelsAndTag[code].labelFactory

    const label = labelFactory({
      ['account-year']: { numberValue: 2040 },
    } as Record<FieldCodeKey, Field>)
    expect(tag).toEqual(eFileTag.account)
    expect(label).toBe('2040_État financiers certifiés')
  })

  it('Code "file-fe-account" should be correct', () => {
    const code = 'file-fe-account'
    const tag = dCodeToLabelsAndTag[code].tag
    const labelFactory = dCodeToLabelsAndTag[code].labelFactory

    const label = labelFactory({
      ['account-year']: { numberValue: 2040 },
    } as Record<FieldCodeKey, Field>)
    expect(tag).toEqual(eFileTag.account)
    expect(label).toBe('2040_Financements étrangers')
  })

})
