import { Module } from '@nestjs/common'
import { FileController } from './controllers/file.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FileService } from './providers/file.service'
import { HttpModule } from '@nestjs/axios'
import { S3Module } from '@/shared/modules/s3/s3.module'
import { File } from '@/modules/files/objects/entities/file.entity'
import { HubModule } from '../hub/hub.module'
import { FileFoundationService } from './providers/file-foundation.service'

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([File]),
    S3Module,
    HubModule,
  ],
  controllers: [FileController],
  providers: [FileService, FileFoundationService],
  exports: [FileService, FileFoundationService],
})
export class FileModule {}
