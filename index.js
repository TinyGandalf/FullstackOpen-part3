const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())
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

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.get('/api/persons', (request, response) => {
  response.send(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(person => person.id == id)

  if (!person) {
    return response.status(404).json({
      error: `No entries for person with id: '${id}'`
    })
  }

  response.send(person)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(person => person.id != id)

  response.status(204).end()
})

const generateId = () => {
  let id = 0

  while (persons.find(person => person.id === id))
    id = Math.floor(Math.random() * 1000000000)

  return id
}

app.post('/api/persons', (request, response) => {
  const id = generateId()
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: "name missing"
    })
  } else if (!body.number) {
    return response.status(400).json({
      error: "number missing"
    })
  } else if (persons.find(person => person.name === body.name)) {
    return response.status(409).json({
      error: `Person with name '${body.name}' already exists`
    })
  }

  const person = {
    id: id,
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)

  response.status(201).json(person)
})

app.get('/info', (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people</p>
                 <p>${Date()}</p>`)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log('Server listening on port: ', PORT)
})