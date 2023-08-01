require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('../models/person')

const app = express()

let persons = [
]

const generateId = () => Math.floor(Math.random() * 100000)

app.use(express.json())
app.use(express.static('build'))
app.use(cors())

morgan.token('data-sent', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data-sent'))

app.get('/api/persons', (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (body.name && body.number) {
    const potentialPerson = persons.find(person => person.name === body.name)
    if (!potentialPerson) {
      const person = new Person({
        name: body.name,
        number: body.number
      })
      person.save().then(savedPerson => {
        response.json(savedPerson)
      })
    } else {
      response.status(409).json({
        error: "name must be unique"
      })
    }
  } else {
    response.status(400).json({
      error: 'name and/or number missing'
    })
  }
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      response.status(404).end()
    })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})

app.get('/info', (request, response) => {
  response.send(`
    <div>Phonebook has info for ${persons.length} people</div>
    <br/>
    <div>${new Date()}</div>
  `)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
