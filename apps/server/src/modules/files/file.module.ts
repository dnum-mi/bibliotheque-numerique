import { Module } from '@nestjs/common'
import { FileController } from './controllers/file.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FileStorage } from './objects/entities/file-storage.entity'
import { FileService } from './providers/file.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([FileStorage]),
  ],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
