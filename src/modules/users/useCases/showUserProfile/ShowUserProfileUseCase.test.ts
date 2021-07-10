import faker from "faker"

import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { ShowUserProfileError } from "./ShowUserProfileError"
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase"

const inMemoryUsersRepository = new InMemoryUsersRepository()
const showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository)
const createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)

describe('show user profile', () => {
  it('should return a existing user', async () => {
    const user = {
      email: faker.internet.email(),
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      password: faker.internet.password()
    }

    const expectedUser = {
      email: user.email,
      name: user.name
    }

    const { id } = await createUserUseCase.execute(user)

    const userProfile = await showUserProfileUseCase.execute(id as string)

    expect(id).not.toBeNull()

    expect(userProfile).toMatchObject(expectedUser)
  })

  it('should throw a error for a not existing id', () => {
    const id = faker.datatype.uuid()

    expect(async () => {
      await showUserProfileUseCase.execute(id)
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  })
})
