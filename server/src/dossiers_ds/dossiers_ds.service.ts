import { Injectable, Logger } from "@nestjs/common";
import { CreateDossierDSDto } from "./dto/create-dossier_ds.dto";
import { UpdateDossierDSDto } from "./dto/update-dossier_ds.dto";

@Injectable()
export class DossiersDSService {
  private readonly logger = new Logger(DossiersDSService.name);

  create(createDossierDSDto: CreateDossierDSDto) {
    return "This action adds a new dossiersDS";
  }

  findAll() {
    return `This action returns all dossiersDS`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dossiersDS`;
  }

  update(id: number, updateDossierDSDto: UpdateDossierDSDto) {
    return `This action updates a #${id} dossiersDS`;
  }

  remove(id: number) {
    return `This action removes a #${id} dossiersDS`;
  }
}
