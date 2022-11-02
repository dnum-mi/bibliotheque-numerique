import { PartialType } from "@nestjs/mapped-types";
import { CreateDossierDSDto } from "./create-dossier_ds.dto";

export class UpdateDossierDSDto extends PartialType(CreateDossierDSDto) {}
