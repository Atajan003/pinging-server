const { google } = require('googleapis')
const jwt = require('jsonwebtoken')

const serviceAccountKeyFile = './pinging-server-sheets.json'
const sheetId = '1lvvQa_ZIuVJmkaJZzAYFiR00PlST_iaKjzdCeD_lglY'
const tabName = 'Sheet1'
const range = 'A:C'

async function GetGoogleSheetClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: serviceAccountKeyFile,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  })
  const authClient = await auth.getClient()
  return google.sheets({
    version: 'v4',
    auth: authClient
  })
}

async function GetRowsByCode(googleSheetClient, code) {
  const res = await googleSheetClient.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${tabName}!${range}`
  })

  const rows = res.data.values
  let rowIndex = -1
  let row = []

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === code) {
      // Assuming 'code' is in the second column
      rowIndex = i + 1 // +1 because Google Sheets API uses 1-based index\

      row.push(...rows[i])
      break
    }
  }

  return { row: row, index: rowIndex }
}

async function UpdateRowByCode(googleSheetClient, rowIndex, newData) {
  const updateResponse = await googleSheetClient.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${tabName}!A${rowIndex}:C${rowIndex}`,
    valueInputOption: 'RAW',
    resource: {
      values: [newData]
    }
  })

  return updateResponse
}

const LoginCheckToken = async (req, res, next) => {
  try {
    const token = req.headers['authorization']
    if (token != undefined) {
      jwt.verify(token, 'normalnybol', (error) => {
        if (!error) {
          console.log('Token dogry')
          next()
        } else {
          console.log('wagty doldy')
          res.status(401).json({ status: 401 })
        }
      })
    } else {
      console.log('Token yok')
      res.status(401).json({ status: 401 })
    }
  } catch (e) {
    console.error(e)
    res.status(500).send(e.message)
  }
}

function CalculateExpiresIn(futureDateStr) {
  // Parse the future date string (e.g., '2024-02-20')
  const futureDate = new Date(futureDateStr)

  // Get the current date
  const now = new Date()

  if (futureDate <= now) {
    return 0
  }

  // Calculate the difference in milliseconds
  let diffInMillis = futureDate - now

  // Add 1 day (20 hours * 60 minutes * 60 seconds * 1000 milliseconds)
  const oneDayInMillis = 20 * 60 * 60 * 1000
  diffInMillis += oneDayInMillis

  // Convert milliseconds to seconds
  const diffInSeconds = Math.floor(diffInMillis / 1000)

  return diffInSeconds
}

module.exports = {
  GetGoogleSheetClient,
  GetRowsByCode,
  UpdateRowByCode,
  LoginCheckToken,
  CalculateExpiresIn
}
