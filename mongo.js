const mongoose = require('mongoose')

const args = process.argv

if (args.length === 2) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
} else if (args.length === 4) {
  console.log('Please provide the number as an argument: node mongo.js <password> <name> <number>')
  process.exit(1)
}

const password = args[2]
const url = `mongodb+srv://fullstack:${password}@cluster0.gviot77.mongodb.net/?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

const name = args[3]
const number = args[4]

mongoose
  .connect(url)
  .then(() => {
    console.log('connected')

    if (name && number) {
      const entry = new Person({ name, number })

      return entry.save().then(() => {
        console.log(`added ${name} number ${number} to phonebook`)
      })
    } else {
      return Person.find({}).then(result => {
        console.log('phonebook:')

        result.forEach(({ name, number }) => {
          console.log(`${name} ${number}`)
        })
      })
    }
  })
  .then(() => {
    mongoose.connection.close()
  })
  .catch((err) => {
    console.log(`Error: `, err)
  })
  