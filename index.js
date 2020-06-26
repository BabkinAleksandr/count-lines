const fs = require('fs')
const readline = require('readline')
const path = require('path')

function countLinesInFile(filePath) {
  let count = 0

  return new Promise((resolve) => {
    fs.createReadStream(filePath, { autoClose: true })
      .on('data', (chunk) => {
          for (let i = 0; i < chunk.length; ++i) {
            if (chunk[i] == 10) {
              count++
            }
          }
      })
      .on('end', () => {
        resolve(count)
      })
  })
}

function readFilesInDirectory(dir) {
  let count = 0

  return new Promise((resolve) => {
    fs.readdir(dir, { withFileTypes: true }, async (err, dirents) => {
      if (err) {
        throw err
      }

      for (let i = 0; i < dirents.length; i++) {
        const dirent = dirents[i]
        const pathname = path.resolve(__dirname, dir, dirent.name)

        if (dirent.isDirectory()) {
          count += await readFilesInDirectory(pathname)
        } else {
          count += await countLinesInFile(pathname)
        }
      }

      resolve(count)
    })
  })
}

async function count() {
  const [dir = './'] = process.argv.slice(2)
  const totalCount = await readFilesInDirectory(path.resolve(__dirname, dir))

  console.log('Total lines count:', totalCount)
  process.exit()
}

count()
