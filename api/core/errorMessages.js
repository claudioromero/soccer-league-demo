module.exports = Object.freeze({

  // Validation-level messages
  INVALID_INPUT_MODEL: 'The input model is invalid. It cannot be null.',
  REQUIRED_FIELD_EXPECTED: 'The %s is required.',
  NO_RECORDS_FOUND: 'No records found',
  CANNOT_BE_NEGATIVE: 'The %s cannot be negative',
  CANNOT_BE_EQUAL: 'A team cannot play against itself. The local and the visitor must be different teams.',

  // Error-level messages
  GENERIC_ERROR_MESSAGE: 'We are sorry. An error occurred while processing your request.',
  FAILED_TO_SEND_SIGNED_TRANSACTION: 'Failed to send signed transaction.',
  FAILED_TO_ESTIMATE_GAS: 'Failed to estimate the gas consumption of the smart contract.',
  FAILED_TO_GET_NONCE: 'Failed to compute the nonce of the transaction.',
  FAILED_TO_GET_GAS_PRICE: 'Failed to get the current gas price.',
  FAILED_TO_GET_LATEST_TX_BLOCK: 'Failed to get the latest transaction block.',
  FAILED_TO_EXECUTE_CONTRACT: 'Failed to execute the smart contract.'
})
