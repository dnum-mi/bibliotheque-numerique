import { Module } from '@nestjs/common'
import { FileStorageController } from './controllers/file-storage.controller'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { FileStorageService } from './providers/file-storage.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [
    HttpModule,
  ],
  controllers: [FileStorageController],
  providers: [ConfigModule, ConfigService, FileStorageService],
  exports: [FileStorageService],
})
export class FileStorageModule {}
