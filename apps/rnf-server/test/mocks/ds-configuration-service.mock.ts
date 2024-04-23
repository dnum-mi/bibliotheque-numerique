import { demandeNumeroRnfMapper, fddCreationMapper, feCreationMapper } from '@/modules/ds/objects/mappers'
import { BadRequestException } from '@nestjs/common'

export const dsConfigurationServiceMock = {
  configuration: {
    dsDemarcheFDDCreationId: 37,
    dsDemarcheFDDCreationAnnotationId: 'Q2hhbXAtMTE4',
    dsDemarcheFDDModificationId: 50,
    dsDemarcheFDDDissolutionId: 51,
    dsDemarcheFECreationId: 12,
    dsDemarcheFECreationAnnotationId: 'Q2hhbXAtMzIx',
    dsDemarcheFEModificationId: 53,
    dsDemarcheFEDissolutionId: 54,
    dsDemarcheDNRId: 43,
    dsDemarcheDNRAnnotationId: 'Q2hhbXAtMTQ3OQ==',
    fieldRegexTitle: '#rnf-titre-rnf#',
    fieldRegexType: '#rnf-type-rnf#',
    fieldRegexAddress: '#rnf-addresse-rnf#',
    fieldRegexEmail: '#rnf-courriel-rnf#',
    fieldRegexPhone: '#rnf-telephone-rnf#',
    fieldRegexStatus: '#rnf-status-rnf#',
    fieldRegexPersonInFoundationToCreate: '#rnf-personne-rnf#',
    cronUpdateFrequency: '* */5 * * * *',
    fieldRegexPersonQuality: '#rnf-person-qualite-rnf#',
    fieldRegexPersonCivility: '#rnf-person-civilite-rnf#',
    fieldRegexPersonFirstName: '#rnf-person-prenom-rnf#',
    fieldRegexPersonLastName: '#rnf-person-nom-rnf#',
    fieldRegexPersonBornAt: '#rnf-person-date-naissance-rnf#',
    fieldRegexPersonBornPlace: '#rnf-person-lieu-naissance-rnf#',
    fieldRegexPersonNationality: '#rnf-person-nationalite-rnf#',
    fieldRegexPersonProfession: '#rnf-person-profession-rnf#',
    fieldRegexPersonAddress: '#rnf-person-adresse-rnf#',
    fieldRegexPersonPhone: '#rnf-person-telephone-rnf#',
    fieldRegexAdministator: '#rnf-administrateur-rnf#',
    fieldRegexFiscalEndDate: '#rnf-date-fin-exercice-rnf#',
    fieldRegexCreatedAt: '#rnf-date-creation-rnf#',
  },
  getMapperFromDemarcheDsId: jest.fn().mockImplementation((n) => {
    switch (`${n}`) {
    case '37':
      return fddCreationMapper
    case '12':
      return feCreationMapper
    case '43':
      return demandeNumeroRnfMapper
    default:
      throw new BadRequestException('This demarche id is not implemented')
    }
  }),
}
