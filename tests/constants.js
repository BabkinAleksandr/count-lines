const path = require('path')

const TEMP_PATH = path.resolve(__dirname, './tmp')
const ITERATIONS = 10 // more then 10 is too slow

module.exports = {
  TEMP_PATH,
  ITERATIONS,
}
