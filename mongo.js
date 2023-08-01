const mongoose = require('mongoose')

if (process.argv.length === 5 || process.argv.length === 3) {
  const password = process.argv[2]

  const url = `mongodb+srv://jeanmadao:${password}@cluster0.mdtdkuj.mongodb.net/phonebookApp?retryWrites=true&w=majority`

  mongoose.set('strictQuery', false)

  mongoose.connect(url)

  const personSchema = new mongoose.Schema({
    name: String,
    number: String,
  })

  const Person = mongoose.model('Person', personSchema)

  if (process.argv.length === 5) {
    const newName = process.argv[3]
    const newNumber = process.argv[4]
    const person = new Person({
      name: newName,
      number: newNumber
    })

    person.save().then(result => {
      console.log(`added ${result.name} number ${result.number} to phonebook`)
      mongoose.connection.close()
    })

  } else if (process.argv.length === 3) {
    console.log("phonebook")
    Person.find({}).then(result => {
      result.forEach(note => {
        console.log(note.name, note.number)
      })
      mongoose.connection.close()
    })
  }
} else {
  console.log('bad usage: node mongo.js <password> (<name> <number>)')
}
