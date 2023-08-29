import { Module } from '@nestjs/common'

import { ConnectorModule } from '../../../modules/connector/connector.module'
import { ParseToOrganismesModule } from '../parserByConnector/parse_to_organismes.module'

import { OrganismesController } from './organismes.controller'

import { OrganismesService } from './organismes.service'
import { OrganismesDatasService } from './organismes_datas.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Organisme } from './organisme.entity'
import { OrganismesData } from './organisme_data.entity'

@Module({
  imports: [ConnectorModule, ParseToOrganismesModule, TypeOrmModule.forFeature([Organisme, OrganismesData])],
  controllers: [OrganismesController],
  providers: [OrganismesService, OrganismesDatasService],
  exports: [OrganismesService],
})
export class OrganismesModule {}
