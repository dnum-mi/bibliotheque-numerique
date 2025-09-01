import { ILastOrganismeOuptut, IOrganismeOfLastImportOutput } from './last-commun-output.type'

export interface ILastFoundationOuptut extends ILastOrganismeOuptut {
  fondations: IOrganismeOfLastImportOutput []
}
