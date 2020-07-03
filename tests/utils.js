const path = require('path')
const fs = require('fs')
const cp = require('child_process')
const { EOL } = require('os');

const uuid = require('uuid').v4
const random = require('lodash/random')

const { TEMP_PATH, ITERATIONS } = require('./constants')

function createDirs() {
  cp.execSync(`mkdir -p ${TEMP_PATH}`)
  cp.execSync(`mkdir -p ${TEMP_PATH}/plain`)
  cp.execSync(`mkdir -p ${TEMP_PATH}/nested`)
}

function cleanDirs() {
  cp.execSync(`rm -rf ${TEMP_PATH}/nested && mkdir -p ${TEMP_PATH}/nested`)
  cp.execSync(`rm -rf ${TEMP_PATH}/plain && mkdir -p ${TEMP_PATH}/plain`)
}

function removeDirs() {
  cp.execSync(`rm -rf ${TEMP_PATH}`)
}

function generateFileWithLines(fileName, lines, isStaticEmptyLines) {
  const isLineEmpty = (i) => (
    isStaticEmptyLines
      ? i % 10 === 0 && i > 0 // every 10th line is empty
      : Math.random() > 0.5 // generate empty lines randomly
  )

  return new Promise((resolve) => {
    const linesCount = lines || random(1, 10000)
    const stream = fs.createWriteStream(fileName, { flags: 'a+', emitClose: true })

    stream.on('close', () => {
      resolve(linesCount)
    })

    for (let i = 0; i < linesCount; i++) {
      const chunk = isLineEmpty(i) 
        ? EOL
        : EOL.padStart(10, '0') // 10 symbols

      stream.write(chunk)
    }

    stream.end()
  })
}

async function generateDirWithFiles(dir) {
  let count = 0
  let pathname = dir

  for (let i = 0; i < 10; i++) {
    const dirName = `${pathname}/${uuid()}`
    const fileName = uuid()

    const file = `${pathname}/${fileName}`
    count += await generateFileWithLines(file)

    cp.execSync(`mkdir ${dirName}`)
    pathname = dirName
  }

  return count
}

async function generateStaticFS() {
  const LINES_COUNT = 1000
  let count = 0

  async function generateFiles(iterations) {
    let count = 0
    const pathname = `${TEMP_PATH}/plain`

    for (let i = 0; i < iterations; i++) {
      const fileName = `${pathname}/${i}.file`

      count += await generateFileWithLines(fileName, LINES_COUNT, true)
    }
    
    return count
  }

  async function generateDirs(iterations) {
    let count = 0
    let pathname = `${TEMP_PATH}/nested`

    for (let i = 0; i < iterations; i++) {
      const dirName = `${pathname}/${i}.dir`
      const fileName = `${pathname}/${i}.file`

      count += await generateFileWithLines(fileName, LINES_COUNT, true)
      cp.execSync(`mkdir ${dirName}`)
      pathname = dirName
    }

    return count
  }

  count += await generateFiles(5)
  count += await generateDirs(5)

  return count
}

function callCLI({ args = [], command = '../linezz.js', cwd = './' }) {
  return new Promise((resolve, reject) => {
    const linezz = cp.spawn('node', [command, ...args], { cwd: path.resolve(__dirname, cwd) })

    linezz.stdout.setEncoding('utf-8')
    linezz.stdout.on('data', resolve)
    linezz.stderr.on('data', reject)
  })
}

module.exports = {
  createDirs,
  cleanDirs,
  removeDirs,
  generateFileWithLines,
  generateDirWithFiles,
  generateStaticFS,
  callCLI,
}
