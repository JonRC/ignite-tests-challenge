import dotenv from 'dotenv'
dotenv.config()

import faker from 'faker'
import { Connection, getConnection } from 'typeorm'
import request from 'supertest'

import { Database } from '../../../../database'
import { app } from '../../../../app'

const database = new Database()
let token: string

describe('balance integration test', () => {
  let connection: Connection
  const depositAmount = faker.datatype.number({
    min: 1,
    max: 100
  })

  beforeAll(async () => {
    connection = await database.init()
    await connection.runMigrations()

    const email = faker.internet.email()
    const password = faker.internet.password()

    await request(app)
      .post('/api/v1/users')
      .send({
        name: `${faker.name.findName()} ${faker.name.lastName()}`,
        email,
        password
      })

    const authenticateResponse = await request(app)
      .post('/api/v1/sessions')
      .send({
        email,
        password
      })

    token = authenticateResponse?.body?.token

    await request(app)
      .post('/api/v1/statements/deposit')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: depositAmount,
        description: faker.lorem.sentence()
      })
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  test('get balence', async () => {
    const { status, body } = await request(app)
      .get('/api/v1/statements/balance')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(status).toBe(200)
    expect(body).toMatchObject({ balance: depositAmount })
  })
})
