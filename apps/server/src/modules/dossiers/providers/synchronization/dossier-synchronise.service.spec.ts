import { LoggerService } from "../../../../shared/modules/logger/logger.service"
import { DossierSynchroniseService } from "./dossier-synchronise.service"
import { DossierWithCustomChamp as TDossier } from '@dnum-mi/ds-api-client'
describe('dossoier-synchronise.service', () => {

  const logger = jest.genMockFromModule<LoggerService>("../../../../shared/modules/logger/logger.service")
  logger.setContext = jest.fn()
  logger.verbose = jest.fn()
  logger.debug = jest.fn()
  it('get prefecture from string with 3 charaters in the departement', ()=>{
      const service  = new DossierSynchroniseService(undefined, logger, undefined, undefined, undefined, undefined,undefined)
      const result = service['_findPrefecture']({
          groupeInstructeur: {
            label :'975 - Saint-Pierre-et-Miquelon'
        }} as TDossier)

      expect(result).toBe('D975')
  })

  it('get prefecture from string wit character –', ()=>{
    const service  = new DossierSynchroniseService(undefined, logger, undefined, undefined, undefined, undefined,undefined)
    const result = service['_findPrefecture']({
        groupeInstructeur: {
          label :'06 – Alpes-Maritimes'
      }} as TDossier)

    expect(result).toBe('D06')
  })

  it('get prefecture from string empty', ()=>{
    const service  = new DossierSynchroniseService(undefined, logger, undefined, undefined, undefined, undefined,undefined)
    const result = service['_findPrefecture']({
        groupeInstructeur: {
          label :''
      }} as TDossier)

    expect(result).toBeNull()
  })

  it('get prefecture from string corse department', ()=>{
    const service  = new DossierSynchroniseService(undefined, logger, undefined, undefined, undefined, undefined,undefined)
    const result = service['_findPrefecture']({
        groupeInstructeur: {
          label :'20A - Corse du Sud'
      }} as TDossier)

      expect(result).toBe('D20A')
  })

})
