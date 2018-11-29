'use strict'

const util = require('util')
const statusCodes = require('../core/statusCodes')
const errorCodes = require('../core/errorCodes')
const errorMessages = require('../core/errorMessages')
const appConstants = require('../core/appConstants')
const logger = require('../core/logger')
const stringHelper = require('../core/stringHelper')
const soccerMatchTrackerAbi = require('../smartContracts/SoccerMatchTrackerAbi')
const Tx = require('ethereumjs-tx')
const level = require('level')
const databaseName = 'db'

let databaseEnaled = true
let blockchainApi = null
let appConfig = null

function getAppConfig () {
  return appConfig
}

function setAppConfig (newConfig) {
  appConfig = newConfig
}

function getBlockchainApi () {
  return blockchainApi
}

function setBlockchainApi (newBlockchainApi) {
  blockchainApi = newBlockchainApi
}

function createProvider (peerNodeAddress) {
  const Web3 = getBlockchainApi()
  return new Web3(new Web3.providers.HttpProvider(peerNodeAddress))
}

function getDb () {
  return databaseEnaled ? level('./' + databaseName) : null
}

function storeMatchResultOnTheBlockchain (inputModel) {
  return new Promise(function (resolve, reject) {
    const contractAddress = getAppConfig().blockchain.contractAddress
    if (stringHelper.stringIsNullOrWhitespace(contractAddress)) {
      reject(new Error('The address of the smart contract was not informed. Check your configuration settings'))
      return
    }

    const peerNodeAddress = getAppConfig().blockchain.peerAddress
    if (stringHelper.stringIsNullOrWhitespace(peerNodeAddress)) {
      reject(new Error('The address of the Ethereum node was not informed. Check your configuration settings'))
      return
    }

    if (stringHelper.stringIsNullOrWhitespace(inputModel.localTeam)) {
      resolve({
        statusCode: statusCodes.VALIDATION_ERROR,
        error: {
          source: appConstants.API_CODE,
          code: errorCodes.REQUIRED_FIELD_EXPECTED,
          message: util.format(errorMessages.REQUIRED_FIELD_EXPECTED, 'name of the local team')
        }
      })
      return
    }

    if (stringHelper.stringIsNullOrWhitespace(inputModel.visitorTeam)) {
      resolve({
        statusCode: statusCodes.VALIDATION_ERROR,
        error: {
          source: appConstants.API_CODE,
          code: errorCodes.REQUIRED_FIELD_EXPECTED,
          message: util.format(errorMessages.REQUIRED_FIELD_EXPECTED, 'name of the visitor team')
        }
      })
      return
    }

    if (inputModel.localScore < 0) {
      resolve({
        statusCode: statusCodes.VALIDATION_ERROR,
        error: {
          source: appConstants.API_CODE,
          code: errorCodes.CANNOT_BE_NEGATIVE,
          message: util.format(errorMessages.CANNOT_BE_NEGATIVE, 'score of the local team')
        }
      })
      return
    }

    if (inputModel.visitorScore < 0) {
      resolve({
        statusCode: statusCodes.VALIDATION_ERROR,
        error: {
          source: appConstants.API_CODE,
          code: errorCodes.CANNOT_BE_NEGATIVE,
          message: util.format(errorMessages.CANNOT_BE_NEGATIVE, 'score of the visitor team')
        }
      })
      return
    }

    if (inputModel.localTeam.trim().toLowerCase() === inputModel.visitorTeam.trim().toLowerCase()) {
      resolve({
        statusCode: statusCodes.VALIDATION_ERROR,
        error: {
          source: appConstants.API_CODE,
          code: errorCodes.CANNOT_BE_EQUAL,
          message: errorMessages.CANNOT_BE_EQUAL
        }
      })
      return
    }

    if (stringHelper.stringIsNullOrWhitespace(inputModel.accountAddress)) {
      resolve({
        statusCode: statusCodes.VALIDATION_ERROR,
        error: {
          source: appConstants.API_CODE,
          code: errorCodes.REQUIRED_FIELD_EXPECTED,
          message: util.format(errorMessages.REQUIRED_FIELD_EXPECTED, 'account address')
        }
      })
      return
    }

    if (stringHelper.stringIsNullOrWhitespace(inputModel.privateKey)) {
      resolve({
        statusCode: statusCodes.VALIDATION_ERROR,
        error: {
          source: appConstants.API_CODE,
          code: errorCodes.REQUIRED_FIELD_EXPECTED,
          message: util.format(errorMessages.REQUIRED_FIELD_EXPECTED, 'private key')
        }
      })
      return
    }

    const fromAccount = inputModel.accountAddress
    const privateKey = inputModel.privateKey
    const privateKeyBuffer = Buffer.from(privateKey, 'hex')

    const localTeamName = inputModel.localTeam.trim()
    const visitorTeamName = inputModel.visitorTeam.trim()
    const localScore = inputModel.localScore
    const visitorScore = inputModel.visitorScore

    // Get the json interface of the smart contract
    const contractAbi = soccerMatchTrackerAbi.getContractInterface()

    // Connect to the ethereum node
    const web3 = createProvider(peerNodeAddress)

    // Get the HEX representation of the team name
    const localTeamHash = web3.utils.utf8ToHex(localTeamName)
    const visitorTeamHash = web3.utils.utf8ToHex(visitorTeamName)

    // Load the smart contract
    const contractInstance = new web3.eth.Contract(contractAbi, contractAddress)

    web3.eth.getBlock('latest').then((latestTransactionBlock) => {
      const lastKnownGasLimit = latestTransactionBlock.gasLimit

      web3.eth.getGasPrice().then((gasPrice) => {
        web3.eth.getTransactionCount(fromAccount).then((nonce) => {
          const rawTransaction = {
            from: fromAccount,
            to: contractAddress,
            nonce: web3.utils.toHex(nonce),
            value: 0,
            data: contractInstance.methods.storeMatchResult(localTeamHash, visitorTeamHash, localScore, visitorScore).encodeABI()
          }

          web3.eth.estimateGas(rawTransaction).then((gasEstimate) => {
            // The minimum gas is 210000, as per Ethereum whitepaper
            const gasAmount = gasEstimate + 210000
            rawTransaction.gas = web3.utils.toHex(gasAmount)
            rawTransaction.gasLimit = web3.utils.toHex(lastKnownGasLimit)
            rawTransaction.gasPrice = web3.utils.toHex(web3.utils.toWei('1', 'gwei'))

            let transaction = new Tx(rawTransaction)
            transaction.sign(privateKeyBuffer)

            web3.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex')).then((transactionReceipt) => {
              resolve({
                statusCode: statusCodes.STATUS_OK,
                error: null,
                data: transactionReceipt
              })
            }).catch((e) => {
              // Failed to send the transaction
              logger.logError(e).then(() => {
                resolve({
                  statusCode: statusCodes.SERVER_APP_ERROR,
                  data: null,
                  error: {
                    source: appConstants.API_CODE,
                    code: errorCodes.FAILED_TO_SEND_SIGNED_TRANSACTION,
                    message: errorMessages.FAILED_TO_SEND_SIGNED_TRANSACTION
                  }
                })
              })
            })
          }).catch((e) => {
            // Failed to estimate the gas
            logger.logError(e).then(() => {
              resolve({
                statusCode: statusCodes.SERVER_APP_ERROR,
                data: null,
                error: {
                  source: appConstants.API_CODE,
                  code: errorCodes.FAILED_TO_ESTIMATE_GAS,
                  message: errorMessages.FAILED_TO_ESTIMATE_GAS
                }
              })
            })
          })
        }).catch((e) => {
          // Failed to get the nonce
          logger.logError(e).then(() => {
            resolve({
              statusCode: statusCodes.SERVER_APP_ERROR,
              data: null,
              error: {
                source: appConstants.API_CODE,
                code: errorCodes.FAILED_TO_GET_NONCE,
                message: errorMessages.FAILED_TO_GET_NONCE
              }
            })
          })
        })
      }).catch((e) => {
        // Failed to get the gas price
        logger.logError(e).then(() => {
          resolve({
            statusCode: statusCodes.SERVER_APP_ERROR,
            data: null,
            error: {
              source: appConstants.API_CODE,
              code: errorCodes.FAILED_TO_GET_GAS_PRICE,
              message: errorMessages.FAILED_TO_GET_GAS_PRICE
            }
          })
        })
      })
    }).catch((e) => {
      // Failed to get the latest transaction block
      logger.logError(e).then(() => {
        resolve({
          statusCode: statusCodes.SERVER_APP_ERROR,
          data: null,
          error: {
            source: appConstants.API_CODE,
            code: errorCodes.FAILED_TO_GET_LATEST_TX_BLOCK,
            message: errorMessages.FAILED_TO_GET_LATEST_TX_BLOCK
          }
        })
      })
    })
  })
}

function getMatchResulsFromTheBlockchain (fromAccount) {
  return new Promise(function (resolve, reject) {
    const contractAddress = getAppConfig().blockchain.contractAddress
    if (stringHelper.stringIsNullOrWhitespace(contractAddress)) {
      reject(new Error('The address of the smart contract was not informed. Check your configuration settings'))
      return
    }

    const peerNodeAddress = getAppConfig().blockchain.peerAddress
    if (stringHelper.stringIsNullOrWhitespace(peerNodeAddress)) {
      reject(new Error('The address of the Ethereum node was not informed. Check your configuration settings'))
      return
    }

    if (stringHelper.stringIsNullOrWhitespace(fromAccount)) {
      resolve({
        statusCode: statusCodes.VALIDATION_ERROR,
        error: {
          source: appConstants.API_CODE,
          code: errorCodes.REQUIRED_FIELD_EXPECTED,
          message: util.format(errorMessages.REQUIRED_FIELD_EXPECTED, 'account address')
        }
      })
      return
    }

    // Get the json interface of the smart contract
    const contractAbi = soccerMatchTrackerAbi.getContractInterface()

    // Connect to the ethereum node
    const web3 = createProvider(peerNodeAddress)

    // Load the smart contract
    const contractInstance = new web3.eth.Contract(contractAbi, contractAddress)

    contractInstance.methods.getScores().call({ from: fromAccount }).then(function (results) {
      // The ordinal position of each output parameter returned by the smart contract (parallel arrays)
      const localTeamHashes = results[0]
      const visitorTeamHashes = results[1]
      const localScores = results[2]
      const visitorScores = results[3]

      // Collect the raw data
      const totalItems = localTeamHashes.length
      const data = []
      for (let i = 0; i < totalItems; i++) {
        data.push({
          localTeamId: localTeamHashes[i],
          visitorTeamId: visitorTeamHashes[i],
          localTeamName: web3.utils.hexToUtf8(localTeamHashes[i]),
          visitorTeamName: web3.utils.hexToUtf8(visitorTeamHashes[i]),
          localScore: parseInt(localScores[i]),
          visitorScore: parseInt(visitorScores[i])
        })
      }

      attemptToSaveQueryResults(data).then(() => {
        resolve({
          statusCode: statusCodes.STATUS_OK,
          error: null,
          data: data
        })
      }).catch((e) => {
        // Failed to cache the results
        logger.logError(e)
        resolve({
          statusCode: statusCodes.STATUS_OK,
          error: null,
          data: data
        })
      })
    }).catch((e) => {
      // Failed to execute the smart contract
      logger.logError('Failed to execute the smart contract: ' + e.message).then(() => {
        resolve({
          statusCode: statusCodes.SERVER_APP_ERROR,
          error: {
            source: appConstants.API_CODE,
            code: errorCodes.FAILED_TO_EXECUTE_CONTRACT,
            message: errorMessages.FAILED_TO_EXECUTE_CONTRACT
          }
        })
      })
    })
  })
}

function getMatchResulsFromDb () {
  return new Promise(function (resolve, reject) {
    const db = getDb()

    db.get('rawData').then((value) => {
      db.close().then(() => {
        const data = JSON.parse(value)
        resolve({
          statusCode: statusCodes.STATUS_OK,
          error: null,
          data: data
        })
      }).catch((e) => {
        logger.logError(e)
        resolve({
          statusCode: statusCodes.STATUS_OK,
          error: null,
          data: []
        })
      })
    }).catch((e) => {
      logger.logError(e).then(() => {
        // Concurrency lock! The process cannot access the file because it is being used by another process.
        // Exit gracefully by returning an empty array
        resolve([])
      })
    })
  })
}

function getRawData (useCache, fromAccount) {
  return (useCache && databaseEnaled) ? getMatchResulsFromDb() : getMatchResulsFromTheBlockchain(fromAccount)
}

function attemptToSaveQueryResults (data) {
  return new Promise(function (resolve, reject) {
    if (!databaseEnaled) {
      resolve()
    } else {
      const db = getDb()

      db.put('rawData', JSON.stringify(data)).then(() => {
        db.close().then(() => {
          resolve()
        }).catch((e) => {
          logger.logError(e)
          resolve()
        })
      }).catch((e) => {
        logger.logError(e)
        resolve()
      })
    }
  })
}

function collectStats (table, record, teamIdField, teamNameField, isLocal) {
  if (!table.has(record[teamIdField])) {
    table.set(record[teamIdField], {
      teamId: record[teamIdField],
      teamName: record[teamNameField],
      played: 0,
      won: 0,
      lost: 0,
      draws: 0,
      points: 0,
      goalsDone: 0,
      goalsAgainst: 0,
      goalsDiff: 0
    })
  }

  const pointsIfYouWin = 3
  const stats = table.get(record[teamIdField])

  stats.played++

  if (isLocal) {
    stats.goalsDone += record.localScore
    stats.goalsAgainst += record.visitorScore

    if (record.localScore > record.visitorScore) {
      stats.won++
      stats.points += pointsIfYouWin
    }
    if (record.localScore < record.visitorScore) {
      stats.lost++
    }
    if (record.localScore === record.visitorScore) {
      stats.draws++
      stats.points++
    }
  } else {
    stats.goalsDone += record.visitorScore
    stats.goalsAgainst += record.localScore

    if (record.visitorScore > record.localScore) {
      stats.won++
      stats.points += pointsIfYouWin
    }
    if (record.visitorScore < record.localScore) {
      stats.lost++
    }
    if (record.visitorScore === record.localScore) {
      stats.draws++
      stats.points++
    }
  }

  stats.goalsDiff = stats.goalsDone - stats.goalsAgainst
}

function getTableOfPositions (useCache, fromAccount) {
  return new Promise(function (resolve, reject) {
    // Get the raw data, either from the blockchain or the DB
    getRawData(useCache, fromAccount).then((serviceResult) => {
      if (serviceResult.statusCode === statusCodes.STATUS_OK) {
        const payload = serviceResult.data
        const table = new Map()
        const stats = []

        // Compute the stats
        payload.map((record) => {
          collectStats(table, record, 'localTeamId', 'localTeamName', true)
          collectStats(table, record, 'visitorTeamId', 'visitorTeamName', false)
        })

        table.forEach(function (value, key) {
          stats.push(value)
        })

        // Sort the table of positions according to a user-defined criteria
        const positionsTable = stats.sort((a, b) => {
          // Priority #1 -> By points first (descending - the more points the better)
          const p = b.points - a.points
          let finalResult = p

          if (p === 0) {
            // Priority #2 -> By goals difference, if both teams have the same amount of points.
            // This goes in Ascending order. The bigger the goal difference, the better.
            const gDiff = a.goalsDiff - b.goalsDiff
            finalResult = gDiff

            if (gDiff === 0) {
              // Priority #3 -> By goals done against the opponent
              // This goes in Ascending order. The bigger the goal difference, the better.
              const gDone = a.goalsDone - b.goalsDone
              finalResult = gDone
            }
          }

          return finalResult
        })

        resolve({
          statusCode: statusCodes.STATUS_OK,
          error: null,
          data: positionsTable
        })
      } else {
        resolve(serviceResult)
      }
    }).catch((e) => {
      reject(e)
    })
  })
}

module.exports = (newBlockchainApi, newAppConfig) => {
  setAppConfig(newAppConfig)
  setBlockchainApi(newBlockchainApi)

  return {
    storeMatchResultOnTheBlockchain,
    getRawData,
    getTableOfPositions
  }
}
