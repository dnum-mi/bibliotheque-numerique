import { Injectable } from "@nestjs/common";

@Injectable()
export class OrganismesDatasService {
  findAll() {
    return `This action returns all organismesDatas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} organismesData`;
  }

  remove(id: number) {
    return `This action removes a #${id} organismesData`;
  }
}
