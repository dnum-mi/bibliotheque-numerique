import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Response,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { FilesService } from "./files.service";

@Controller("files")
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.uploadFile(file);
  }

  @Get(":id")
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async download(@Param("id") id: string, @Response() response) {
    const file = await this.filesService.getFile(id);
    file.stream.pipe(response);
  }

  @Post("copy")
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async copyFile(
    @Body("fileUrl") fileUrl: string,
    @Body("fileName") fileName: string,
    @Body("checksum") checksum: string,
    @Body("mimeType") mimeType: string,
    @Body("byteSize") byteSize: string,
  ) {
    return await this.filesService.copyRemoteFile(
      fileUrl,
      checksum,
      byteSize,
      mimeType,
      fileName,
    );
  }
}
