import { Module } from "@nestjs/common";
import { PeopleService } from "@/modules/people/providers/people.service";

@Module({
  imports: [],
  controllers: [],
  providers: [PeopleService],
  exports: [PeopleService],
})
export class PeopleModule {}
