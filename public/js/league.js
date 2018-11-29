const domainUrl = 'https://blockchain-demo-224000.appspot.com' // 'http://localhost:8080'

function showMessage (tag, clsName, msg, caption, canBeDismissed) {
  document.getElementById('dvMessageHeader').innerText = caption
  document.getElementById('dvMessageInner').innerText = msg
  document.getElementById('dvMessages').className = clsName
}

function clearAlert () {
  document.getElementById('dvMessageHeader').innerText = ''
  document.getElementById('dvMessageInner').innerText = ''
  document.getElementById('dvMessages').className = 'ui warning message transition hidden'
}

function showError (msg) {
  showMessage('dvMessages', 'ui red message', msg, 'Error!', true)
}

function showWarning (msg) {
  showMessage('dvMessages', 'ui warning message', msg, 'Warning!', true)
}

function showSuccess (msg) {
  showMessage('dvMessages', 'ui positive message', msg, 'Well done!', true)
}

function showInfo (msg) {
  showMessage('dvMessages', 'ui blue message', msg, 'Working', false)
}

function isNumeric (num) {
  return !isNaN(num)
}

function sendRequest (inputModel, targetUrl) {
  return new Promise(function (resolve, reject) {
    const req = new XMLHttpRequest()

    req.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          const serverResponse = JSON.parse(this.responseText)

          if (serverResponse.statusCode === 200) {
            resolve(serverResponse)
          } else {
            reject(new Error(serverResponse.error.message))
          }
        } else {
          reject(new Error('Failed to execute the request'))
        }
      }
    }

    try {
      req.open('post', targetUrl, true)
      req.setRequestHeader('Content-type', 'application/json')
      req.send(JSON.stringify(inputModel))
    } catch (error) {
      reject(error)
    }
  })
}

function sendGetRequest (targetUrl) {
  return new Promise(function (resolve, reject) {
    const req = new XMLHttpRequest()

    req.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          const serverResponse = JSON.parse(this.responseText)

          if (serverResponse.statusCode === 200) {
            resolve(serverResponse.data)
          } else {
            reject(new Error(serverResponse.error.message))
          }
        } else {
          reject(new Error('Failed to execute the request'))
        }
      }
    }

    try {
      req.open('get', targetUrl, true)
      req.setRequestHeader('Content-type', 'application/json')
      req.send()
    } catch (error) {
      reject(error)
    }
  })
}

function saveData () {
  clearAlert()

  const localTeamName = document.getElementById('cboLocalTeam').value
  const visitorTeamName = document.getElementById('cboVisitorTeam').value
  const localScore = document.getElementById('txtLocalScore').value
  const visitorScore = document.getElementById('txtVisitorScore').value
  const accountAddress = document.getElementById('txtPublicAddress').value
  const privateKey = document.getElementById('txtPrivateKey').value

  if (localTeamName.trim().length === 0) {
    showWarning('Please select the local team')
    $('#tbNewMatch').click()
    return
  }

  if (visitorTeamName.trim().length === 0) {
    showWarning('Please select the visitor')
    $('#tbNewMatch').click()
    return
  }

  if (localScore.trim().length === 0) {
    showWarning('Please enter the score of the local team')
    $('#tbNewMatch').click()
    return
  }

  if (visitorScore.trim().length === 0) {
    showWarning('Please enter the score of the visitor')
    $('#tbNewMatch').click()
    return
  }

  if (!isNumeric(localScore)) {
    showWarning('The score of the local team must be numeric')
    $('#tbNewMatch').click()
    return
  }

  if (!isNumeric(visitorScore)) {
    showWarning('The score of the visitors must be numeric')
    $('#tbNewMatch').click()
    return
  }

  if (parseInt(localScore) < 0) {
    showWarning('The score of the local team cannot be negative')
    $('#tbNewMatch').click()
    return
  }

  if (parseInt(visitorScore) < 0) {
    showWarning('The score of the visitors cannot be negative')
    $('#tbNewMatch').click()
    return
  }

  if (accountAddress.trim().length === 0) {
    showWarning('Please enter your public address')
    $('#tbMyAccount').click()
    return
  }

  if (privateKey.trim().length === 0) {
    showWarning('Please enter your private key')
    $('#tbMyAccount').click()
    return
  }

  showInfo('Publishing results on the Blockchain. This may take a while...')

  const model = {
    localTeam: localTeamName.trim(),
    visitorTeam: visitorTeamName.trim(),
    localScore: parseInt(localScore),
    visitorScore: parseInt(visitorScore),
    accountAddress: accountAddress,
    privateKey: privateKey
  }

  const url = domainUrl + '/match'
  sendRequest(model, url).then(() => {
    showSuccess('The match results were recorded on the Blockchain')
    document.getElementById('cboLocalTeam').selectedIndex = -1
    document.getElementById('cboVisitorTeam').selectedIndex = -1
    document.getElementById('txtLocalScore').value = ''
    document.getElementById('txtVisitorScore').value = ''
  }).catch((e) => {
    showError(e.message)
  })
}

function getRawData () {
  const accountAddress = document.getElementById('txtPublicAddress').value

  if (accountAddress.trim().length === 0) {
    showWarning('Please enter your public address')
    $('#tbMyAccount').click()
    return
  }

  const readFromDb = (document.getElementById('rbReadFromBlockchain').checked) ? '0' : '1'
  const url = domainUrl + '/match/raw?cache=' + readFromDb + '&account=' + accountAddress
  const convertToTeamNames = document.getElementById('chkDisplay').checked

  sendGetRequest(url).then((data) => {
    const tableRef = document.getElementById('tbRawData').getElementsByTagName('tbody')[0]

    while (tableRef.hasChildNodes()) {
      tableRef.removeChild(tableRef.firstChild)
    }

    data.map((record) => {
      const newRow = tableRef.insertRow(tableRef.rows.length)
      const localTeamCell = newRow.insertCell(0)
      const l = convertToTeamNames ? record.localTeamName : record.localTeamId
      localTeamCell.appendChild(document.createTextNode(l))

      const visitorTeamCell = newRow.insertCell(1)
      const v = convertToTeamNames ? record.visitorTeamName : record.visitorTeamId
      visitorTeamCell.appendChild(document.createTextNode(v))

      const localScoreCell = newRow.insertCell(2)
      localScoreCell.appendChild(document.createTextNode(record.localScore))

      const visitorScoreCell = newRow.insertCell(3)
      visitorScoreCell.appendChild(document.createTextNode(record.visitorScore))
    })
  }).catch((e) => {
    showError(e.message)
  })
}

function getTableOfPositions () {
  const accountAddress = document.getElementById('txtPublicAddress').value

  if (accountAddress.trim().length === 0) {
    showWarning('Please enter your public address')
    $('#tbMyAccount').click()
    return
  }

  const readFromDb = (document.getElementById('ptReadFromBlockchain').checked) ? '0' : '1'
  const url = domainUrl + '/match/stats?cache=' + readFromDb + '&account=' + accountAddress

  sendGetRequest(url).then((data) => {
    const tableRef = document.getElementById('tbPositionsTable').getElementsByTagName('tbody')[0]

    while (tableRef.hasChildNodes()) {
      tableRef.removeChild(tableRef.firstChild)
    }

    let k = 0
    data.map((record) => {
      k++
      const newRow = tableRef.insertRow(tableRef.rows.length)
      let cell = newRow.insertCell(0)
      cell.appendChild(document.createTextNode(k))

      cell = newRow.insertCell(1)
      cell.appendChild(document.createTextNode(record.teamName))

      cell = newRow.insertCell(2)
      cell.appendChild(document.createTextNode(record.points))

      cell = newRow.insertCell(3)
      cell.appendChild(document.createTextNode(record.played))

      cell = newRow.insertCell(4)
      cell.appendChild(document.createTextNode(record.won))

      cell = newRow.insertCell(5)
      cell.appendChild(document.createTextNode(record.lost))

      cell = newRow.insertCell(6)
      cell.appendChild(document.createTextNode(record.draws))

      cell = newRow.insertCell(7)
      cell.appendChild(document.createTextNode(record.goalsDiff))

      cell = newRow.insertCell(8)
      cell.appendChild(document.createTextNode(record.goalsDone))

      cell = newRow.insertCell(9)
      cell.appendChild(document.createTextNode(record.goalsAgainst))
    })
  }).catch((e) => {
    showError(e.message)
  })
}
