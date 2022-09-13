const cors = require('cors')
const morgan = require('morgan')
const express = require('express')
const app = express()

require('dotenv').config()

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    req.method === 'POST' ? JSON.stringify(req.body) : ''
  ].join(' ')
}))

const Person = require('./models/person')

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => response.send(persons))
})

// app.get('/api/persons/:id', (request, response) => {
//   const id = request.params.id
//   const person = persons.find(person => person.id == id)

//   if (!person) {
//     return response.status(404).json({
//       error: `No entries for person with id: '${id}'`
//     })
//   }

//   response.send(person)
// })

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: "name missing"
    })
  } else if (!body.number) {
    return response.status(400).json({
      error: "number missing"
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(() => {
    response.status(201).json(person)
  })
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.send(updatedPerson)
    })
    .catch(error => next(error))
})

// app.get('/info', (request, response) => {
//   response.send(`<p>Phonebook has info for ${persons.length} people</p>
//                  <p>${Date()}</p>`)
// })

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
const errorHandler = (error, request, response, next) => {
  console.error(error)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'invalid ID' })
  }

  next(error)
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log('Server listening on port: ', PORT)
})