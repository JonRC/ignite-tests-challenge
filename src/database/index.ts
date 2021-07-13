import { ConnectionOptions, createConnection, getConnection, getConnectionOptions } from 'typeorm';

class Database {
  async init() {
    const connectionOptions = await getConnectionOptions()

    const environment = process.env.NODE_ENV

    const database = environment === 'test'
      ? 'test_fin_api'
      : connectionOptions.database

    Object.assign(connectionOptions, {
      database
    } as ConnectionOptions)

    await createConnection(connectionOptions)

    const connection = getConnection()

    return connection
  }
}

export { Database }
