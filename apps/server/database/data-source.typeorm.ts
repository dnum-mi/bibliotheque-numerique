import { DataSource } from 'typeorm'
import { options } from './typeorm.config'

const opts = options()
export const dataSource = new DataSource(opts)

dataSource
  .initialize()
  .then(() => {
    console.log('====================================================')
    console.log('Datasource initialized successfully')
    console.log('Connected to ' + opts.database)
    console.log('====================================================\n')
  })
  .catch((e) => {
    console.log('====================================================')
    console.log('Datasource initialization failed')
    console.log(e)
    console.log('====================================================\n')
  })
