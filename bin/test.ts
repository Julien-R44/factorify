import { pathToFileURL } from 'node:url'
import { expect } from '@japa/expect'
import { specReporter } from '@japa/spec-reporter'
import { configure, processCliArgs, run } from '@japa/runner'
import { database } from '@julr/japa-database-plugin'
import { factorio } from '@julr/japa-factorio-plugin'
import { connection, connectionConfig } from '../tests-helpers/db.js'

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

configure({
  ...processCliArgs(process.argv.slice(2)),
  ...{
    files: ['tests/**/*.spec.ts'],
    plugins: [
      database({ database: connectionConfig }),
      factorio({ database: connectionConfig }),
      expect(),
    ],
    reporters: [specReporter()],
    teardown: [
      async () => {
        await connection.destroy()
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
