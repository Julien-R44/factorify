import knex from 'knex'
import type { Knex } from 'knex'

export class DatabaseSetup {
  private static client: Knex

  public static init(connectionString: string) {
    this.client = knex({ client: 'pg', connection: { connectionString } })
  }

  public static disconnect() {
    return this.client.destroy()
  }

  public static async refreshDatabase() {
    const tableNames = await this.client
      .select('table_name')
      .from('information_schema.tables')
      .where('table_schema', 'public')
      .andWhere('table_type', 'BASE TABLE')
      .pluck('table_name')

    for (const tableName of tableNames) {
      await this.client.raw(`TRUNCATE TABLE "${tableName}" CASCADE`)
    }
  }
}
