import { ILastOrganismeOuptut, IOrganismeOfLastImportOutput } from './last-commun-output.type'

export interface ILastAssocationOuptut extends ILastOrganismeOuptut {
  associations: IOrganismeOfLastImportOutput []
}
