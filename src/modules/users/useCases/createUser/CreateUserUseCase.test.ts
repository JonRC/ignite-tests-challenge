import faker from 'faker'

import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserError } from './CreateUserError'
import { CreateUserUseCase } from "./CreateUserUseCase"

const inMemoryUsersRepository = new InMemoryUsersRepository()
const createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)

describe('Create user useCase', () => {
  it('should create a new user', async () => {
    const user = {
      email: faker.internet.email(),
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      password: faker.internet.password()
    }

    const expectedUser = {
      email: user.email,
      name: user.name
    }

    const newUser = await createUserUseCase.execute(user)

    expect(newUser).toHaveProperty('id')
    expect(newUser).toHaveProperty('password')
    expect(newUser).toMatchObject(expectedUser)
  })

  it('should not create a new user for an existing e-mail', async () => {
    const email = faker.internet.email()

    const user = {
      email,
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      password: faker.internet.password()
    }

    const duplicatedEmailUser = {
      email,
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      password: faker.internet.password()
    }

    await createUserUseCase.execute(user)

    expect(async () => {
      await createUserUseCase.execute(duplicatedEmailUser)
    }).rejects.toBeInstanceOf(CreateUserError)

  })
})
