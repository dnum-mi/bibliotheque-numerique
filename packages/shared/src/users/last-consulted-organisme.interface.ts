import { IBasicOrganisme } from '../hub'

export interface ILastConsultedOrganisme extends IBasicOrganisme {
  consultedAt: Date;
}
