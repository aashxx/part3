require('dotenv').config();
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI).then(()=>{
    console.log('Mongo connected!')
}).catch(err => {
    console.log('Failed to connect...');
})

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        unique: true,
        required: true
    },
    number: {
        type: String,
        minlength: 8,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })
personSchema.plugin(uniqueValidator);

module.exports = mongoose.model('persons', personSchema);

