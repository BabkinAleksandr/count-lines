const { performance } = require('perf_hooks')
const assert = require('assert')
const { createDirs, removeDirs, generateStaticFS } = require('./utils')
const { handleArgs } = require('../src')
const { TEMP_PATH } = require('./constants')

const ITERATIONS = 10000
let TIME = 0

async function makeTest() {
  try {
    createDirs()
    await generateStaticFS()

    for (let i = 0; i < ITERATIONS; i++) {
      const arg = i % 2 === 0
        ? [TEMP_PATH]
        : [`${TEMP_PATH}/plain`, `${TEMP_PATH}/nested`]

      const start = performance.now()
      const sum = await handleArgs(arg)
      const end = performance.now()

      TIME += end - start

      assert(sum === 10000) // just to be sure it was counted correctly
    }
  } catch (err) {
    console.error(err)
  }
  removeDirs()

  console.log(`Execution time for ${ITERATIONS} iterations is: ${Math.round(TIME)}ms`)
}

makeTest()
