import { Demarche } from '../../../src/modules/demarches/objects/entities/demarche.entity'
import { Dossier } from '../../../src/modules/dossiers/objects/entities/dossier.entity'
import { faker } from '@faker-js/faker/locale/fr'
import { DossierState } from '@dnum-mi/ds-api-client/dist/@types/types'

export function getFakeDossierTest (dataJson: object | null, demarche?: Demarche): Partial<Dossier> {
  return {
    dsDataJson: dataJson || JSON.parse(faker.datatype.json()),
    demarche,
    state: faker.datatype.string() as unknown as DossierState,
  }
}
