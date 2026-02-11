const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname, '../../')
const dataMinigDir = path.join(rootDir, 'data minig')
const outputDir = path.join(rootDir, 'boursehorus-next-client/public/data/indices')

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

function processFile(inputFile, outputName, indexSymbol, indexName) {
  const inputPath = path.join(dataMinigDir, inputFile)
  const outputPath = path.join(outputDir, outputName)

  if (fs.existsSync(inputPath)) {
    const rawData = fs.readFileSync(inputPath, 'utf8')
    const data = JSON.parse(rawData)
    const constituents = data.map((item) => item.symbol)

    const outputData = {
      symbol: indexSymbol,
      name: indexName,
      constituents: constituents,
    }

    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2))
    console.log(`Generated ${outputName} with ${constituents.length} constituents.`)
  } else {
    console.log(`File not found: ${inputFile}`)
  }
}

processFile('nasdaq_constituent.json', 'nasdaq.json', '^NDX', 'NASDAQ 100')
processFile('dowjones_constituent.json', 'dowjones.json', '^DJI', 'Dow Jones Industrial Average')
