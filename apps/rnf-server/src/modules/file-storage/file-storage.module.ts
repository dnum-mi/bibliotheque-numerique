import { Module } from '@nestjs/common'
import { FileStorageController } from './controllers/file-storage.controller'
import { FileStorageService } from './providers/file-storage.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [
    HttpModule,
  ],
  controllers: [FileStorageController],
  providers: [FileStorageService],
  exports: [FileStorageService],
})
export class FileStorageModule {}
