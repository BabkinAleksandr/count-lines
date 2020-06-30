const path = require('path')
const fs = require('fs')
const cp = require('child_process')
const uuid = require('uuid').v4
const random = require('lodash/random')

const { countLinesInFile, readFilesInDirectory, readDirOrFile, count, RESULT_TEXT } = require('../src')

const { TEMP_PATH, ITERATIONS } = require('./constants')
const {
  createDirs,
  cleanDirs,
  removeDirs,
  generateFileWithLines,
  generateDirWithFiles,
  callCLI,
} = require('./utils')

beforeEach(createDirs)
afterEach(removeDirs)

describe('countLinesInFile', () => {
  test('properly counts lines in a file', async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const fileName = `${TEMP_PATH}/plain/${uuid()}`
      const linesGenerated = await generateFileWithLines(fileName)
      const linesCounted = await countLinesInFile(fileName)

      expect(linesCounted).toBe(linesGenerated)
    }
  })
})

describe('readFilesInDirectory', () => {
  test('properly count lines in dir ans subdirs', async () => {
    for (let i = 0; i <= ITERATIONS; i++) {
      // clean dir before each iteration
      cp.execSync(`rm -rf ${TEMP_PATH}/nested && mkdir -p ${TEMP_PATH}/nested`)

      const linesGenerated = await generateDirWithFiles(`${TEMP_PATH}/nested`)
      const linesCounted = await readFilesInDirectory(`${TEMP_PATH}/nested`)

      expect(linesCounted).toBe(linesCounted)
    }
  })
})

describe('readDirOrFile', () => {
  test('counts lines in dir', async () => {
    const fileName = `${TEMP_PATH}/plain/${uuid()}`
    const linesGenerated = await generateFileWithLines(fileName)
    const linesCounted = await countLinesInFile(fileName)

    expect(linesCounted).toBe(linesGenerated)
  })

  test('counts lines in file', async () => {
    const linesGenerated = await generateDirWithFiles(`${TEMP_PATH}/nested`)
    const linesCounted = await readFilesInDirectory(`${TEMP_PATH}/nested`)

    expect(linesCounted).toBe(linesCounted)
  })
})

describe('cli', () => {
  beforeEach(cleanDirs)

  async function generateFiles() {
    let linesCount = 0

    // generate files and nested file structure
    for (let i = 0; i < ITERATIONS; i++) {
      linesCount += await generateDirWithFiles(`${TEMP_PATH}/nested`)
      linesCount += await generateFileWithLines(`${TEMP_PATH}/${uuid()}`)
    }

    return linesCount
  }

  test('counts lines for provided dir', async () => {
    const linesGenerated = await generateFiles()
    const output = await callCLI({ args: [TEMP_PATH] })

    expect(output.trim()).toBe(`${RESULT_TEXT} ${linesGenerated}`)
  })

  test('counts lines for existing dir, if no dir provided', async () => {
    const linesGenerated = await generateFiles()
    const output = await callCLI({ command: '../../linezz.js', cwd: TEMP_PATH })

    expect(output.trim()).toBe(`${RESULT_TEXT} ${linesGenerated}`)
  })

  test('counts lines for file', async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const fileName = `${TEMP_PATH}/plain/${uuid()}`
      const linesGenerated = await generateFileWithLines(fileName)
      const output = await callCLI({ args: [fileName] })

      expect(output.trim()).toBe(`${RESULT_TEXT} ${linesGenerated}`)
    }
  })

  test('exits with success code (zero)', async (next) => {
    const fileName = `${TEMP_PATH}/plain/${uuid()}`
    const linesGenerated = await generateFileWithLines(fileName)

    const linezz = cp.spawn('node', ['../linezz.js', TEMP_PATH], {
      cwd: path.resolve(__dirname, './'),
      stdio: 'inherit',
    })

    linezz.on('exit', (code) => {
      expect(code).toBe(0)

      next()
    })
  })
})
