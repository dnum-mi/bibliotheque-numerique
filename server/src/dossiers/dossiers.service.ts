import { Injectable } from "@nestjs/common";
import { Dossier } from "../entities";

@Injectable()
export class DossiersService {
  findAll() {
    return Dossier.all();
  }

  findOne(id: number) {
    return Dossier.findOneBy({ id: id });
  }

  findOneWithDetail(id: number) {
    return Dossier.findOne({
      where: { id: id },
      relations: { dossierDS: true },
    });
  }

  async remove(id: number) {
    const dossier = await Dossier.findOneBy({ id: id });
    if (dossier) {
      return dossier.remove();
    }
  }
}
