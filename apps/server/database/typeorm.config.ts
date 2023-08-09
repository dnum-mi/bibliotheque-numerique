import { resolve } from 'path'
import { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions'

export const options = (): DataSourceOptions =>
  ({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT) || 5432,
    username: process.env.POSTGRES_USERNAME || 'user',
    password: process.env.POSTGRES_PASSWORD || 'password',
    database: process.env.POSTGRES_DB || 'biblio-num',
    schema: process.env.POSTGRES_SCHEMA || 'public',
    logging: false,
    synchronize: false,
    migrationsTableName: 'migrations',
    entities: [resolve(__dirname, '../src/**/**.entity.{ts,js}')],
    migrations: [
      resolve(__dirname, './migrations/*.{ts,js}'),
      resolve(__dirname, '../src/plugins/migrations/*.{ts,js}'),
    ],
  } as DataSourceOptions)
