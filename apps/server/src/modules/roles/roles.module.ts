import { Module } from '@nestjs/common'
import { RolesService } from './providers/roles.service'
import { RolesController } from './controllers/roles.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Role } from './entities/role.entity'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [TypeOrmModule.forFeature([Role]), UsersModule],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
