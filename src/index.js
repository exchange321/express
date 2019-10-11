const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')
const { Deserializer } = require('jsonapi-serializer')
const { IncomingWebhook } = require('@slack/webhook')

const deserializer = new Deserializer({
  keyForAttribute: 'camelCase'
})

const deserialize = (data) => new Promise((resolve, reject) => {
  deserializer.deserialize(data, (err, data) => {
    if (err) {
      return reject(err)
    }

    return resolve(data)
  })
})

const config = {
  name: 'express',
  port: 8888,
  host: '0.0.0.0'
}

const app = express()
const slack = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL)

app.use(bodyParser.json())
app.use(cors())

app.post('/', async (req, res) => {
  const { payload: { id: goalId } } = req.body;

  const { data } = await axios.get(`http://master-large-demo.local.internihr.ninja/api/goals/${goalId}?include=person`, {
    headers: {
      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsYXBpcyIsInVzZXJfaWQiOiJkMmZlOGQ0OS0xY2I2LTRkOTMtOGQ5OS1hOTEwYWZlYzBiOTQiLCJ0ZW5hbnQiOiJtYXN0ZXJfbGFyZ2VfZGVtbyIsImV4cCI6MjUzNDAyMzAwNzk5fQ.4HWyBPSBvq98QJFSbrDNzxLHY-y-q40kjxT56nxv1nc"
    }
  })

  const { name, person: { displayName } } = await deserialize(data)
  await slack.send({
    text: `Congratulation! ${displayName}, you have received a reward of 10 Bonusly point for completing your goal: "${name}"!`
  })
})

app.listen(config.port, config.host, (e) => {
  if (e) {
    throw new Error('Internal Server Error')
  }

  console.log(`${config.name} running on ${config.host}:${config.port}`)
})
