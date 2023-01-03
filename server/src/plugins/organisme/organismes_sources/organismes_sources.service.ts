import { Injectable } from "@nestjs/common";

@Injectable()
export class Organismes_sourcesService {
  findAll() {
    return `This action returns all organismesSources`;
  }

  findOne(id: number) {
    return `This action returns a #${id} organismesSource`;
  }

  remove(id: number) {
    return `This action removes a #${id} organismesSource`;
  }
}
