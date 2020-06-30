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

function generateFileWithLines(fileName) {
  return new Promise((resolve) => {
    const linesCount = random(1, 10000)
    const stream = fs.createWriteStream(fileName, { flags: 'a+', emitClose: true })

    stream.on('close', () => {
      resolve(linesCount)
    })

    for (let i = 0; i < linesCount; i++) {
      const chunk = Math.random() > 0.5 // generate empty lines randomly
        ? EOL
        : EOL.padStart(10, '0') // 10 symbols

      stream.write(chunk)
    }

    stream.end()
  })
}

function generateDirWithFiles(dir) {
  let count = 0

  return new Promise(async (resolve) => {
    let pathname = dir

    for (let i = 0; i < 10; i++) {
      const dirName = `${pathname}/${uuid()}`
      const fileName = uuid()

      const file = `${pathname}/${fileName}`
      count += await generateFileWithLines(file)

      cp.execSync(`mkdir ${dirName}`)
      pathname = dirName
    }

    resolve(count)
  })
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
  callCLI,
}
