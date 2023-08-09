import { Module } from '@nestjs/common'
import { ConnectorService } from './connector.service'
import { HttpModule } from '@nestjs/axios'
import { ConnectorController } from './connector.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Connector } from './connector.entity'

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Connector])],
  controllers: [ConnectorController],
  providers: [ConnectorService],
  exports: [ConnectorService],
})
export class ConnectorModule {}
