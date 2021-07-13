import faker from 'faker'
import { Connection, getConnection } from 'typeorm'
import request from 'supertest'

import { Database } from '../../../../database'
import { app } from '../../../../app'

const database = new Database()

describe('create user integration test ', () => {
  let connection: Connection

  beforeAll(async () => {
    connection = await database.init()
    await connection.runMigrations()
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  test('create a new user', async () => {
    const { status, body } = await request(app)
      .post('/api/v1/users')
      .send({
        name: `${faker.name.findName()} ${faker.name.lastName()}`,
        email: faker.internet.email(),
        password: faker.internet.password()
      })

    expect(status).toBe(201)
  })

  test('create a already exists user', async () => {
    const email = faker.internet.email()

    await request(app)
      .post('/api/v1/users')
      .send({
        name: `${faker.name.findName()} ${faker.name.lastName()}`,
        email,
        password: faker.internet.password()
      })

    const { status } = await request(app)
      .post('/api/v1/users')
      .send({
        name: `${faker.name.findName()} ${faker.name.lastName()}`,
        email,
        password: faker.internet.password()
      })

    expect(status).toBe(400)
  })
})
