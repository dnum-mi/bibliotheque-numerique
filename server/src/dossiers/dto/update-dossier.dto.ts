import { PartialType } from '@nestjs/mapped-types';
import { CreateDossierDto } from './create-dossier.dto';

export class UpdateDossierDto extends PartialType(CreateDossierDto) {}
