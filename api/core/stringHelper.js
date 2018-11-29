'use strict'

exports.stringIsNullOrWhitespace = (inputText) => {
  if (typeof inputText === 'undefined' || inputText == null || inputText.trim().length === 0) {
    return true
  }

  return false
}
