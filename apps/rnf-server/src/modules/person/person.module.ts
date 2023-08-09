import { Module } from '@nestjs/common'
import { PersonService } from '@/modules/person/providers/person.service'

@Module({
  imports: [],
  controllers: [],
  providers: [PersonService],
  exports: [PersonService],
})
export class PersonModule {}
