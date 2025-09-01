import { Module } from '@nestjs/common'
import { FileController } from './controllers/file.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FileService } from './providers/file.service'
import { HttpModule } from '@nestjs/axios'
import { S3Module } from '@/shared/modules/s3/s3.module'
import { File } from '@/modules/files/objects/entities/file.entity'
import { HubModule } from '../hub/hub.module'
import { FileOrganismeHubService } from './providers/file-organisme-hub.service'

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([File]),
    S3Module,
    HubModule,
  ],
  controllers: [FileController],
  providers: [FileService, FileOrganismeHubService],
  exports: [FileService, FileOrganismeHubService],
})
export class FileModule {}
