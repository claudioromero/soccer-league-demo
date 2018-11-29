'use strict'

const statusCodes = require('../core/statusCodes')
const errorCodes = require('../core/errorCodes')
const errorMessages = require('../core/errorMessages')
const appConstants = require('../core/appConstants')
const logger = require('../core/logger')

let gameMatchService = null

function getGameMatchService () {
  return gameMatchService
}

function setGameMatchService (newService) {
  gameMatchService = newService
}

function saveMatchResults (req, res) {
  getGameMatchService().storeMatchResultOnTheBlockchain(req.body).then((serviceResult) => {
    res.status(200).json(serviceResult).end()
  }).catch((e) => {
    logger.logError(e)
    res.status(200).json({
      statusCode: statusCodes.SERVER_APP_ERROR,
      error: {
        source: appConstants.API_CODE,
        code: errorCodes.GENERIC_ERROR_MESSAGE,
        message: errorMessages.GENERIC_ERROR_MESSAGE
      },
      data: null
    }).end()
  })
}

function getRawData (req, res) {
  const useCache = ((req.query.cache) && (req.query.cache === '1'))
  const fromAccount = req.query.account

  getGameMatchService().getRawData(useCache, fromAccount).then((serviceResult) => {
    res.status(200).json(serviceResult).end()
  }).catch((e) => {
    logger.logError(e)
    res.status(200).json({
      statusCode: statusCodes.SERVER_APP_ERROR,
      error: {
        source: appConstants.API_CODE,
        code: errorCodes.GENERIC_ERROR_MESSAGE,
        message: errorMessages.GENERIC_ERROR_MESSAGE
      },
      data: null
    }).end()
  })
}

function getTableOfPositions (req, res) {
  const useCache = ((req.query.cache) && (req.query.cache === '1'))
  const fromAccount = req.query.account

  getGameMatchService().getTableOfPositions(useCache, fromAccount).then((serviceResult) => {
    res.status(200).json(serviceResult).end()
  }).catch((e) => {
    logger.logError(e)
    res.status(200).json({
      statusCode: statusCodes.SERVER_APP_ERROR,
      error: {
        source: appConstants.API_CODE,
        code: errorCodes.GENERIC_ERROR_MESSAGE,
        message: errorMessages.GENERIC_ERROR_MESSAGE
      },
      data: null
    }).end()
  })
}

module.exports = (newGameMatchService) => {
  setGameMatchService(newGameMatchService)

  return {
    saveMatchResults,
    getRawData,
    getTableOfPositions
  }
}
