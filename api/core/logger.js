'use strict'

exports.logError = (errorMsg) => {
  return new Promise(function (resolve, reject) {
    console.error('[Error] ' + errorMsg)
    resolve()
  })
}

exports.logInfo = (msg) => {
  return new Promise(function (resolve, reject) {
    console.log('[Info] ' + msg)
    resolve()
  })
}
