import { Injectable } from "@nestjs/common";
import { CreateDossierDto } from "./dto/create-dossier.dto";
import { UpdateDossierDto } from "./dto/update-dossier.dto";
import { Dossier } from "../entities";

@Injectable()
export class DossiersService {
  create(createDossierDto: CreateDossierDto) {
    return "This action adds a new dossier";
  }

  findAll() {
    return Dossier.all();
  }

  findOne(id: number) {
    return Dossier.findOneBy({ id: id });
  }

  update(id: number, updateDossierDto: UpdateDossierDto) {
    return `This action updates a #${id} dossier`;
  }

  remove(id: number) {
    return `This action removes a #${id} dossier`;
  }
}
