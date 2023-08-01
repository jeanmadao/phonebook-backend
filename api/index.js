require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('../models/person')

const app = express()

app.use(express.static('build'))
app.use(express.json())
app.use(cors())
morgan.token('data-sent', (req, res) => JSON.stringify(req.body))
app.use(morgan((tokens, req, res) => {
  return [
    "Method: ", tokens.method(req, res), "\n",
    "Path: ", tokens.url(req, res), "\n",
    "Status: ", tokens.status(req, res), "\n",
    "Content length: ", tokens.res(req, res, 'content-length'), "\n",
    "Response time: ", tokens['response-time'](req, res), 'ms', "\n",
    "Body: ", tokens['data-sent'](req, res), "\n",
    "---"
  ].join('')
}))


app.get('/api/people', (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
})

app.post('/api/people', (request, response) => {
  const body = request.body

  if (body.name && body.number) {
    const person = new Person({
      name: body.name,
      number: body.number
    })
    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
  } else {
    response.status(400).json({
      error: 'name and/or number missing'
    })
  }
})

app.get('/api/people/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.put('/api/people/:id', (request, response) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/people/:id', (request, response) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
  response.send(`
    <div>Phonebook has info for ${people.length} people</div>
    <br/>
    <div>${new Date()}</div>
  `)
})


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknownEndpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error("Error:", error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
