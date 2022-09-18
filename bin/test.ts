import { pathToFileURL } from 'node:url'
import { defineFactorioConfig } from '@julr/factorio'
import { expect } from '@japa/expect'
import { specReporter } from '@japa/spec-reporter'
import { configure, processCliArgs, run } from '@japa/runner'
import { database } from '@julr/japa-database-plugin'
import { connection } from '../tests-helpers/db.js'

/*
|--------------------------------------------------------------------------
| Configure tests
|--------------------------------------------------------------------------
|
| The configure method accepts the configuration to configure the Japa
| tests runner.
|
| The first method call "processCliArgs" process the command line arguments
| and turns them into a config object. Using this method is not mandatory.
|
| Please consult japa.dev/runner-config for the config docs.
*/

const dbConfig = {
  client: 'better-sqlite3',
  useNullAsDefault: true,
  connection: { filename: './test.sqlite' },
}

const disconnect = defineFactorioConfig({ database: dbConfig })

configure({
  ...processCliArgs(process.argv.slice(2)),
  ...{
    files: ['tests/**/*.spec.ts'],
    plugins: [database({ database: dbConfig }), expect()],
    reporters: [specReporter()],
    teardown: [
      async () => {
        await connection.destroy()
        disconnect()
      },
    ],
    importer: (filePath) => import(pathToFileURL(filePath).href),
  },
})

/*
|--------------------------------------------------------------------------
| Run tests
|--------------------------------------------------------------------------
|
| The following "run" method is required to execute all the tests.
|
*/
run()
