import { describe, expect, it } from 'vitest'
import { toRowData } from './toHeaderList'
// import exampleDS from './__tests__/examples.json'

// const dataJson = exampleDS[0].dossierDS.dataJson
// const mappingColumn = [
//   // {
//   //   id: 'Q2hhbXAtMTE5',
//   //   labelSource: ['state'],
//   //   labelBN: 'Déclaration initiale de création',
//   //   typeName: 'etat',
//   //   typeData: 'champ',
//   //   typeValue: 'Text',
//   // },
//   {
//     id: 'Q2hhbXAtMTE6',
//     labelSource: ['Déclaration initiale de création'],
//     labelBN: 'Déclaration initiale de création',
//     typeName: '',
//     typeData: 'champ',
//     typeValue: 'Text',
//   },
//   {
//     id: 'Q2hhbXAtMTE7',
//     labelSource: ['Autorité ayant délivré le récépissé de déclaration de création du fonds de dotation'],
//     labelBN: 'Préfecture',
//     typeName: '',
//     typeData: 'champ',
//     typeValue: 'Text',
//   },
//   {
//     id: 'Q2hhbXAtMTE8',
//     labelSource: ['Date du récépissé actant la création du fonds de dotation'],
//     labelBN: 'Date création',
//     typeName: '',
//     typeData: 'champ',
//     typeValue: 'Text', // Date
//   },
//   {
//     id: 'Q2hhbXAtMTE9',
//     labelSource: ['Nature des modifications statutaires'],
//     labelBN: 'Modifications statutaires',
//     typeName: '',
//     typeData: 'champ',
//     typeValue: 'Text', // Array
//   },
//   {
//     id: 'Q2hhbXAtMTEA',
//     labelSource: ["Membres du conseil d'administration du fonds de dotation"],
//     labelBN: 'Memnbres',
//     typeName: '',
//     typeData: 'champ',
//     typeValue: 'file',
//   },
//   {
//     id: 'Q2hhbXAtMTEB',
//     labelSource: ['Adresse du siège social du fonds de dotation'],
//     labelBN: 'Adresse',
//     typeName: '',
//     typeData: 'champ',
//     typeValue: 'Text', // Adresse
//   },
// ]

describe('Test HeaderList', () => {
  const dataJson = {
    champs: [
      {
        id: 'testhamps1',
        label: 'champSource1',
        stringValue: 'test 1 value',
      },
      {
        id: 'testhamps2',
        label: 'champSource2',
        stringValue: 'test 2 value',
      },
      {
        id: 'testhamps3',
        label: 'champSource3',
        stringValue: 'test 3 value',
      },
      {
        id: 'testChamp4',
        label: 'champSource4',
        champs: [
          {
            id: 'testChamp4-1',
            label: 'champSource4-1',
            stringValue: 'test 4-1 value ',
          },
          {
            id: 'testChamp4-2',
            label: 'champSource4-2',
            stringValue: 'test 4-2 value ',
          },
        ],
        stringValue: '',
      },

    ],
    annotations: [
      {
        id: 'testAnnotation1',
        label: 'annotationSource1',
        stringValue: 'test 1 value',
      },
      {
        id: 'testAnnotation2',
        label: 'annotationSource2',
        stringValue: 'test 2 value',
      },
      {
        id: 'testAnnotation3',
        label: 'annotationSource3',
        stringValue: 'test 3 value',
      },
    ],

  }

  it('should to convert to rowData for champ type Text', () => {
    const mappingColumn = [
      {
        id: 'test1',
        labelSource: ['champSource1'],
        labelBN: 'label1',
        typeName: 'typeRender1',
        typeData: 'champ',
        typeValue: 'Text',
      },
      {
        id: 'test1000',
        labelSource: ['champSource1000'],
        labelBN: 'label1000',
        typeName: 'typeRender1000',
        typeData: 'champ',
        typeValue: 'Text',

      },
    ]

    const result = toRowData(dataJson, mappingColumn)
    expect(result).toBeDefined()
    expect(result).toMatchObject({
      [mappingColumn[0].id]: dataJson.champs[0].stringValue,
      [mappingColumn[1].id]: undefined,
    })
  })

  it('should to convert to rowData for annotation type Text', () => {
    const mappingColumn = [
      {
        id: 'test1',
        labelSource: ['annotationSource1'],
        labelBN: 'label1',
        typeName: 'typeRender1',
        typeData: 'annotation',
        typeValue: 'Text',
      },
      {
        id: 'test1000',
        labelSource: ['annotationSource1000'],
        labelBN: 'label1000',
        typeName: 'typeRender1000',
        typeData: 'annotation',
        typeValue: 'Text',

      },
    ]
    const result = toRowData(dataJson, mappingColumn)
    expect(result).toBeDefined()
    expect(result).toMatchObject({
      [mappingColumn[0].id]: dataJson.annotations[0].stringValue,
      [mappingColumn[1].id]: undefined,
    })
  })

  it('should to convert to rowData for champs type repetition', () => {
    const mappingColumn = [
      {
        id: 'test4-1',
        labelSource: ['champSource4', 'champSource4-1'],
        labelBN: 'label4-1',
        typeName: 'typeRender4-1',
        typeData: 'champ',
        typeValue: 'Text',
      },
      {
        id: 'test4-1000',
        labelSource: ['champSource4-1000'],
        labelBN: 'label4-1000',
        typeName: 'typeRender4-1000',
        typeData: 'champ',
        typeValue: 'Text',

      },
    ]
    const result = toRowData(dataJson, mappingColumn)
    expect(result).toBeDefined()
    expect(result).toMatchObject({
      [mappingColumn[0].id]: dataJson.champs[3].champs[0].stringValue,
      [mappingColumn[1].id]: undefined,
    })
  })
})
