import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'

export const getAdminCookie = (app: INestApplication): Promise<string> => {
  return (
    request(app.getHttpServer())
      // @ts-ignore The property 'post' really exists
      .post('/auth/sign-in')
      .send({
        email: 'admin@localhost.com',
        password: 'password',
      })
      .then((res) => {
        return res.header['set-cookie'][0].split(';')[0]
      })
  )
}
