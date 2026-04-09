import { registerAs } from '@nestjs/config'

export default registerAs('file', () => ({
  driver: process.env.FILE_DRIVER || 'local',
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  awsDefaultS3Bucket: process.env.AWS_DEFAULT_S3_BUCKET,
  awsMaarchS3Bucket: process.env.AWS_MAARCH_S3_BUCKET || 'maarch-pj',
  maarchImportRootPath: process.env.MAARCH_IMPORT_ROOT_PATH || 'import-maarch-pj',
  maarchImportFolderCourrier: process.env.MAARCH_IMPORT_FOLDER_COURRIER || 'manual',
  maarchImportFolderPieceJointe: process.env.MAARCH_IMPORT_FOLDER_PIECE_JOINTE || 'manual_attachments',
  maarchImportFolderAccuseReception: process.env.MAARCH_IMPORT_FOLDER_ACCUSE_RECEPTION || 'ACKNOWLEDGEMENT_RECEIPTS',
  awsDefaultS3Url: process.env.AWS_DEFAULT_S3_URL,
  awsS3Region: process.env.AWS_S3_REGION,
  localStorageDir: process.env.FILE_STORAGE_LOCAL_DIR || './data/files',
  maxFileSize: process.env.MAX_FILE_STORAGE_SIZE || 5242880, // 5mb
  authorizedExtensions: process.env.FILE_AUTHORIZED_EXTENSIONS?.split('|') || ['*'],
}))
