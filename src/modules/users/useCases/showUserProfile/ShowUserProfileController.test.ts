import dotenv from 'dotenv'
dotenv.config()

import faker from 'faker'
import { Connection, getConnection } from 'typeorm'
import request from 'supertest'

import { Database } from '../../../../database'
import { app } from '../../../../app'

const database = new Database()

describe('show user profile integration test', () => {
  let connection: Connection

  beforeAll(async () => {
    connection = await database.init()
    await connection.runMigrations()
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  test('get show profile', async () => {
    const email = faker.internet.email()
    const password = faker.internet.password()
    const name = `${faker.name.findName()} ${faker.name.lastName()}`

    await request(app)
      .post('/api/v1/users')
      .send({
        name,
        email,
        password
      })

    const authenticateResponse = await request(app)
      .post('/api/v1/sessions')
      .send({
        email,
        password
      })

    const { token } = authenticateResponse?.body

    const { status, body } = await request(app)
      .get('/api/v1/profile')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(status).toBe(200)
    expect(body).toMatchObject({ name, email })

  })
})
