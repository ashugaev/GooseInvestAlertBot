import { GoogleSpreadsheet } from 'google-spreadsheet'

import { serviceAccountAuth } from './index'
;(async () => {
  const doc = new GoogleSpreadsheet(
    '1uOUAjkLQeMLPiV1vWQxZOxgN3PrBfDFUUpByLfh9g4M',
    serviceAccountAuth
  )
  const newSheet = await doc.addSheet({ title: 'Sheet Test' })
  const res = await newSheet.addRows([
    {
      hello: 'world',
      bye: 'earth',
    },
  ])

  const sheet = await doc.addSheet({ headerValues: ['name', 'email'] })
})()
