import faker from "faker"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { OperationType } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase"
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase"

const inMemoryUsersRepository = new InMemoryUsersRepository()
const inMemoryStatementsRepository = new InMemoryStatementsRepository()

const createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
const createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
const getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)

describe('get statement operation', () => {
  it('should return the specificated statement', async () => {
    const user = await createUserUseCase.execute({
      email: faker.internet.email(),
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      password: faker.internet.password()
    })

    const userId = user?.id

    const amount = faker.datatype.number({
      min: 0
    })

    const depositStatement = await createStatementUseCase.execute({
      amount,
      description: faker.lorem.paragraph(),
      type: "deposit" as OperationType,
      user_id: userId as string
    })

    const statementId = depositStatement?.id

    const statement = await getStatementOperationUseCase.execute({
      statement_id: statementId as string,
      user_id: userId as string
    })

    expect(statement).toEqual(depositStatement)
  })
})
