import ParseApiRnaV3 from './api_rna_v3'
import { loggerServiceMock } from '../../../../test/mock/logger-service.mock'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { getFakeDatasFromRNA } from '../../../../test/unit/fake-data/organisme-data.fake-data'

describe('Parser API_RNA_V3', () => {
  it('should have organisme', () => {
    const dataExpected = getFakeDatasFromRNA()
    const parser = new ParseApiRnaV3(loggerServiceMock as unknown as LoggerService)

    const organisme = parser.toOrganismeEntity(undefined, dataExpected)
    expect(organisme).toBeDefined()

    expect(organisme).toHaveProperty('idRef', dataExpected.rna_id)
    expect(organisme).toHaveProperty('title', dataExpected.titre)
    expect(organisme.address).toMatch(new RegExp(Object.values(dataExpected.adresse_siege).join(' | ')))

    expect(organisme).toHaveProperty('zipCode', dataExpected.adresse_siege.code_postal)
    expect(organisme).toHaveProperty('city', dataExpected.adresse_siege.commune)
    expect(organisme.dateCreation.toISOString()).toBe(dataExpected.date_creation)
    expect(organisme.dateDeclaration.toISOString()).toBe(dataExpected.date_declaration)
    expect(organisme.datePublication.toISOString()).toBe(dataExpected.date_publication)
    expect(organisme.dateDissolution.toISOString()).toBe(dataExpected.date_dissolution)
    expect(organisme.dateModification.toISOString()).toBe(dataExpected.mise_a_jour)
  })
})
