/* eslint-disable */
import { LoggerService } from '../../../../shared/modules/logger/logger.service';
import { loggerServiceMock } from '../../../../../test/mock/logger-service.mock';
import { DemarcheSynchroniseService } from './demarche-synchronise.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Demarche } from '@dnum-mi/ds-api-client';
import { FormatFunctionRef } from '@biblio-num/shared';

const fakeDemarche = {
  activeRevision: {
    champDescriptors: [
      {
        __typename: 'HeaderSectionChampDescriptor',
        id: 'Q2hhbXAtMzE=',
        label: 'Informations de base',
        description: '',
        required: false,
      },
      {
        __typename: 'DropDownListChampDescriptor',
        id: 'Q2hhbXAtMTA0Mw==',
        label: "Quel est l'organisme bénéficiaire de la déclaration ?",
        description: '',
        required: false,
        options: [
          'Une association cultuelle régie par la loi du 9 décembre 1905',
          'Une association régie par la loi du 1er juillet 1901 (association dite mixte)',
          'Une association inscrite à objet cultuel située en Alsace-Moselle',
          'Une congrégation',
          'Un établissement public du culte (Alsace-Moselle)',
        ],
        otherOption: false,
      },
      {
        __typename: 'RNAChampDescriptor',
        id: 'Q2hhbXAtMzI=',
        label: "Saisir le n°RNA de l'association",
        description:
          'Le numéro RNA se compose de la lettre « W » suivi du code de votre département (ou pour les outremers du chiffre 9 + une lettre) suivi de 7 chiffres.',
        required: false,
      },
      {
        __typename: 'ExplicationChampDescriptor',
        id: 'Q2hhbXAtMzM=',
        label: 'Où trouver mon n°RNA ?',
        description:
          '<a href="https://www.service-public.fr/associations/vosdroits/F34726" target="blank">Cliquer ici</a> pour savoir où trouver votre numéro RNA ?',
        required: false,
        collapsibleExplanationEnabled: false,
        collapsibleExplanationText: null,
      },
      {
        __typename: 'PieceJustificativeChampDescriptor',
        id: 'Q2hhbXAtNTY=',
        label: 'Chargement du fichier complété à partir du modèle',
        description:
          'Merci de veiller à compléter le modèle sans en modifier la structure (ne pas ajouter de colonne, ne pas faire de mise en forme, etc.)',
        required: false,
        fileTemplate: {
          filename: 'modele-financements-inferieurs-15300.xlsx',
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          checksum: 'TYfaas3CfEWOgE+EE1D3Ig==',
          byteSize: '9810',
          url: 'https://195.154.196.196:3000/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhkblJvZGpreE0zaGhlR2sxYVhoNGIzRnpkR1J3Y2pGemVYbHFNZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpQVh4aGRIUmhZMmh0Wlc1ME95Qm1hV3hsYm1GdFpUMGliVzlrWld4bExXWnBibUZ1WTJWdFpXNTBjeTFwYm1abGNtbGxkWEp6TFRFMU16QXdMbmhzYzNnaU95Qm1hV3hsYm1GdFpTbzlWVlJHTFRnbkoyMXZaR1ZzWlMxbWFXNWhibU5sYldWdWRITXRhVzVtWlhKcFpYVnljeTB4TlRNd01DNTRiSE40QmpzR1ZEb1JZMjl1ZEdWdWRGOTBlWEJsU1NKR1lYQndiR2xqWVhScGIyNHZkbTVrTG05d1pXNTRiV3htYjNKdFlYUnpMVzltWm1salpXUnZZM1Z0Wlc1MExuTndjbVZoWkhOb1pXVjBiV3d1YzJobFpYUUdPd1pVT2hGelpYSjJhV05sWDI1aGJXVTZDbXh2WTJGcyIsImV4cCI6IjIwMjMtMDgtMjBUMDg6NTg6MjIuNDI0WiIsInB1ciI6ImJsb2Jfa2V5In19--e47262c71910b03cd17bb0d9380b7f1a914bf8dd/modele-financements-inferieurs-15300.xlsx',
        },
      },
      {
        __typename: 'RepetitionChampDescriptor',
        id: 'Q2hhbXAtMTA0OA==',
        label: "Déclaration d'un financement d'un montant supérieur à 15 300 €",
        description: '',
        required: false,
        champDescriptors: [
          {
            __typename: 'PaysChampDescriptor',
            id: 'Q2hhbXAtMTA0OQ==',
            label: "Pays d'origine du financement",
            description: '',
            required: false,
          },
          {
            __typename: 'IntegerNumberChampDescriptor',
            id: 'Q2hhbXAtMTA1MA==',
            label: 'Montant du financement',
            description:
              "Pour les sommes d'argent, indiquez la valeur nominale de la somme donnée (somme reçue). Pour les valeurs cotées en bourse, référez-vous à la cote officielle. La valeur des biens est obligatoirement en euros (€). Attention : ne portez pas les centimes d’euros. \r\n",
            required: false,
          },
          {
            __typename: 'PieceJustificativeChampDescriptor',
            id: 'Q2hhbXAtMTA1MQ==',
            label: 'Bien vouloir joindre un document listant les personnes mises à disposition',
            description:
              'indiquer pour chacune des personnes mises à disposition, leur NOM Prénom et date de naissance.',
            required: false,
            fileTemplate: null,
          },
        ],
      },
      {
        __typename: 'IntegerNumberChamp',
        id: 'Q2hhbXAtMTA0Nw==',
        label: 'Numéro de quelque chose',
        description: "numéro d'un truc",
        required: false,
      },
    ],
    annotationDescriptors: [
      {
        __typename: 'DropDownListChampDescriptor',
        id: 'Q2hhbXAtODc=',
        label: 'Association déclarée cultuelle dans télédéclaration loi CRPR ?',
        description: '',
        required: false,
        options: ['Oui', 'Non'],
        otherOption: false,
      },
      {
        __typename: 'DateChampDescriptor',
        id: 'Q2hhbXAtODg=',
        label: "Si oui, date d'entrée en vigueur de la qualité cultuelle",
        description: '',
        required: false,
      },
      {
        __typename: 'ExplicationChampDescriptor',
        id: 'Q2hhbXAtNTQ0',
        label: "Délai d'instruction",
        description: '60',
        required: false,
        collapsibleExplanationEnabled: false,
        collapsibleExplanationText: null,
      },
    ],
  },
};

describe('Generating demarche mapping columns', () => {
  let service: DemarcheSynchroniseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [DemarcheSynchroniseService],
    })
      .useMocker((token) => {
        if (token === LoggerService) {
          return loggerServiceMock;
        }
        return {};
      })
      .compile();

    service = module.get<DemarcheSynchroniseService>(DemarcheSynchroniseService);
  });

  it('Should create a correct mapping column', () => {
    expect(service['_generateMappingColumns'](fakeDemarche as unknown as Partial<Demarche>)).toEqual([
      {
        id: '96151176-4624-4706-b861-722d2e53545d',
        columnLabel: 'ID',
        originalLabel: 'Id démarche simplifié',
        type: 'number',
        source: 'fix-field',
      },
      {
        id: '1a4b62c4-b81f-4e83-ac34-f6d601b8a8d4',
        columnLabel: 'Status',
        originalLabel: 'Status',
        type: 'string',
        formatFunctionRef: 'status',
        source: 'fix-field',
      },
      {
        id: '9863ce70-6378-4d7e-aca9-b81fb7b97c11',
        columnLabel: null,
        originalLabel: 'Date de dépot',
        type: 'date',
        source: 'fix-field',
      },
      {
        id: '9863ce70-6378-4d7e-aca9-b81fb7b97c12',
        columnLabel: null,
        originalLabel: 'Date de passage en instruction',
        type: 'date',
        source: 'fix-field',
      },
      {
        id: '9863ce70-6378-4d7e-aca9-b81fb7b97c13',
        columnLabel: null,
        originalLabel: 'Date de passage en construction',
        type: 'date',
        source: 'fix-field',
      },
      {
        id: 'Q2hhbXAtMzE=',
        originalLabel: 'Informations de base',
        columnLabel: null,
        formatFunctionRef: null,
        source: 'champs',
        type: 'string',
      },
      {
        id: 'Q2hhbXAtMTA0Mw==',
        originalLabel: "Quel est l'organisme bénéficiaire de la déclaration ?",
        columnLabel: null,
        formatFunctionRef: null,
        source: 'champs',
        type: 'string',
      },
      {
        id: 'Q2hhbXAtMzI=',
        originalLabel: "Saisir le n°RNA de l'association",
        columnLabel: null,
        formatFunctionRef: null,
        source: 'champs',
        type: 'string',
      },
      {
        id: 'Q2hhbXAtMzM=',
        originalLabel: 'Où trouver mon n°RNA ?',
        columnLabel: null,
        formatFunctionRef: null,
        source: 'champs',
        type: 'string',
      },
      {
        id: 'Q2hhbXAtNTY=',
        originalLabel: 'Chargement du fichier complété à partir du modèle',
        columnLabel: null,
        formatFunctionRef: null,
        source: 'champs',
        type: 'file',
      },
      {
        id: 'Q2hhbXAtMTA0OA==',
        originalLabel: "Déclaration d'un financement d'un montant supérieur à 15 300 €",
        columnLabel: null,
        formatFunctionRef: null,
        source: 'champs',
        type: 'string',
        children: [
          {
            id: 'Q2hhbXAtMTA0OQ==',
            originalLabel: "Pays d'origine du financement",
            columnLabel: null,
            formatFunctionRef: FormatFunctionRef.country,
            source: 'champs',
            type: 'string',
          },
          {
            id: 'Q2hhbXAtMTA1MA==',
            originalLabel: 'Montant du financement',
            columnLabel: null,
            formatFunctionRef: null,
            source: 'champs',
            type: 'number',
          },
          {
            id: 'Q2hhbXAtMTA1MQ==',
            originalLabel: 'Bien vouloir joindre un document listant les personnes mises à disposition',
            columnLabel: null,
            formatFunctionRef: null,
            source: 'champs',
            type: 'file',
          },
        ]
      },
      {
        id: 'Q2hhbXAtMTA0Nw==',
        originalLabel: 'Numéro de quelque chose',
        columnLabel: null,
        formatFunctionRef: null,
        source: 'champs',
        type: 'string',
      },
      {
        id: 'Q2hhbXAtODc=',
        originalLabel: 'Association déclarée cultuelle dans télédéclaration loi CRPR ?',
        columnLabel: null,
        formatFunctionRef: null,
        source: 'annotation',
        type: 'string',
      },
      {
        id: 'Q2hhbXAtODg=',
        originalLabel: "Si oui, date d'entrée en vigueur de la qualité cultuelle",
        columnLabel: null,
        formatFunctionRef: null,
        source: 'annotation',
        type: 'date',
      },
      {
        id: 'Q2hhbXAtNTQ0',
        originalLabel: "Délai d'instruction",
        columnLabel: null,
        formatFunctionRef: null,
        source: 'annotation',
        type: 'string',
      },
    ]);
  });
});
