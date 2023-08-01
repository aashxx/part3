require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/mongo'); // Mongoose schema
const app = express();

const port = process.env.PORT;


// Middlewares
app.use(express.json());
app.use(express.static('build'))
app.use(cors());


// Morgan middleware
app.use(morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      JSON.stringify(req.body)
    ].join(' ')
  }))

app.get('/', (req,res) => {
    res.send('Hello bro!');
});


// ROUTE:1 - Fetch persons. method GET. endpoint: /api/persons
app.get('/api/persons', (req,res) => {
    Person.find({}).then(persons => {
        res.json(persons.map(person => person.toJSON()))
    })
});

// ROUTE:2 - Add persons. method POST. endpoint: /api/persons
app.post('/api/persons', async (req,res) => {
    let body = req.body;

    if(!body.name && !body.number) {
        res.status(400).json({error: 'Data is missing'});
    }

    else {
        const person = new Person({
            name: body.name,
            number: body.number
        })
    
        person.save().then(res => console.log('Note saved'))
        res.json(person);
    }
});

// ROUTE:3 - Fetch a person. method GET. endpoint: /api/persons/:id
app.get('/api/persons/:id', async (req,res) => {
    const personId = req.params.id;
    const person = await Person.findById(personId);
    if(!person) {
        res.status(400).send('Not Found');
    } else {
        res.json({person});
    }
});

// ROUTE:4 - Delete a person. method DELETE. endpoint: /api/persons/:id
app.delete('/api/persons/:id', async (req,res) => {
    const personId = req.params.id;
    const person = await Person.findById(personId);
    if(!person) {
        res.status(400).send('Not Found');
    } else {
        const deletePerson = await Person.findByIdAndDelete(personId);
        res.json({success: true, deletePerson});
    }
})

// ROUTE:5 - Update a person's number. method PUT. endpoint: /api/persons/:id
app.put('/api/persons/:id', async (req,res) => {
    const personId = req.params.id;
    const person = await Person.findById(personId);
    if(!person) {
        res.status(400).send('Not Found');
    } else {
        const {name, number} = req.body;
        const updatedPerson = {};
        if(name){updatedPerson.name = name};
        if(number){updatedPerson.number = number};
        
        let updatePerson = await Person.findByIdAndUpdate(personId, {$set: updatedPerson}, {new: true});
        res.json({updatePerson});
    }
})

// ROUTE:6 - Backend processing info. method GET. endpoint: /info
app.get('/info', async (req,res) => {
    const currentDate = new Date().toLocaleString();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    res.send(`<p>The phonebook has info of ${await Person.length} people </p>
    <br>
    <p>${currentDate} ${timeZone}</p>`);
});

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
      }
      next(error)
}

app.use(errorHandler);

app.listen(port, () => {
    console.log(`App is listening at port ${port}`);
});