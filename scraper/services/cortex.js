function transcribeAssay(str, url) {

  const lines = str.split('\n')
  for (const line of lines) {
    console.log('line', line)
  }

  return 'CBD'
}

module.exports = {
  transcribeAssay
}