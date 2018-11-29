'use strict'

const stringHelper = require('../core/stringHelper')

// The default environment code
const defaultEnvironmentCode = 'development'

// The tool or library responsible for dealing with configuration files, command line arguments and environment variables
let configurationBundle = null

function getConfigurationBundle () {
  return configurationBundle
}

function setConfigurationBundle (newConfigurationBundle) {
  configurationBundle = newConfigurationBundle
}

/**
* @summary Gets the value of the configuration setting specified.
* @param {string} key - Specifies the key of the configuration setting.
* @returns {string} Returns the value of the setting.
*/
function getKey (key) {
  return getConfigurationBundle().get(key)
}

/**
* @summary Gets the current application environment.
* @description
* This method returns the contents of the environment variable 'NODE_ENV'
* If the variable is undefined it will return the default environment code, which is 'local'
* @returns {string} Returns the environment code
*/
function getCurrentEnvironment () {
  return getKey('NODE_ENV') || defaultEnvironmentCode
}

/**
* @summary Loads the application configuration.
* @description
* Requests the configuration library to read the configuration settings based on the current environment code specified.
*/
function loadConfiguration () {
  getConfigurationBundle().argv()
  getConfigurationBundle().env()
  getConfigurationBundle().file({
    file: './api/config/config.' + getCurrentEnvironment() + '.json',
    logicalSeparator: '.'
  })
}

/**
* @summary Gets the current configuration settings of the application.
* @returns {Object} Returns the current configuration settings of the application.
*/
function getConfig () {
  return {
    environment: getCurrentEnvironment(),
    server: {
      port: getKey('server.port')
    },

    blockchain: {
      peerAddress: getKey('blockchain.peerAddress'),
      contractAddress: getKey('blockchain.contractAddress')
    }
  }
}

/**
* @summary Validates the configuration key specified
* @param {string} keyName - Specifies the key of the configuration setting.
*/
function validateEnvironmentVariable (keyName) {
  if (stringHelper.stringIsNullOrWhitespace(getKey(keyName)) === true) {
    const msg = 'Unable to launch the application. The environment variable ' + keyName + ' was not set. Define the environment variable on the YAML configuration file and try again.'
    throw new Error(msg)
  }
}

module.exports = (newConfigurationBundle) => {
  setConfigurationBundle(newConfigurationBundle)
  loadConfiguration()

  return {
    getKey,
    getConfig,
    validateEnvironmentVariable
  }
}
