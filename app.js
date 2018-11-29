'use strict'

// Dependencies
const express = require('express')
const bodyParser = require('body-parser')
const logger = require('./api/core/logger')
const WEB3API = require('web3')
const configurationBundle = require('nconf')

// Configuration
const configManager = require('./api/core/configurationManager')(configurationBundle)
const appConfig = configManager.getConfig()

// Middleware setup
const server = express()
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: false }))

// Services
const gameMatchService = require('./api/services/gameMatchService')(WEB3API, appConfig)

// API Routes
require('./api/routing/routes')(server, gameMatchService)

// Serve static contents from the path below
server.use(express.static(__dirname + '/public'))

// Start the server
const port = appConfig.server.port
server.listen(port, function () {
  logger.logInfo('Soccer league API listening on port ' + port)
  logger.logInfo('Current environment is: ' + appConfig.environment)
  logger.logInfo('Ethereum Node Address: ' + appConfig.blockchain.peerAddress)
  logger.logInfo('Smart contract address: ' + appConfig.blockchain.contractAddress)
})

module.exports = server
