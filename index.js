const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

const port = 3001;

app.use(express.json());
app.use(express.static('build'))
app.use(cors());

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

app.get('/', (req,res) => {
    res.send('Hello bro!');
});

app.get('/api/persons', (req,res) => {
    res.json(persons);
});

const generateId = () => {
    const maxId = persons.length > 0
      ? Math.max(...persons.map(person => person.id))
      : 0
    return maxId + 1
  }

app.post('/api/persons', (req,res) => {
    let body = req.body;

    if(!body.name && !body.number) {
        res.status(400).json({error: 'Data is missing'});
    }

    const dupPerson = persons.find(person => person.name === body.name);
    if(dupPerson){
        res.status(400).json({error: 'Name must be unique'});
    }

    else {
        const person = {
            "id": generateId(),
            "name": body.name,
            "number": body.number
        }
    
        persons = persons.concat(person);
        res.json(person);
    }
});

app.get('/api/persons/:id', (req,res) => {
    const personId = Number(req.params.id);
    const person = persons.find(person => person.id === personId);
    if(!person) {
        res.status(400).send('Not Found');
    } else {
        res.json(person);
    }
});

app.delete('/api/persons/:id', (req,res) => {
    const personId = Number(req.params.id);
    const person = persons.find(person => person.id === personId);
    if(!person) {
        res.status(400).send('Not Found');
    } else {
        persons = persons.filter(person => person.id !== personId);
        res.status(204).end()
    }
})

app.put('/api/persons/:id', (req,res) => {
    const personId = Number(req.params.id);
    const person = persons.find(person => person.id === personId);
    if(!person) {
        res.status(400).send('Not Found');
    } else {
        const {name, number} = req.body;
        const updatedPerson = {};
        if(name){updatedPerson.name = name};
        if(number){updatedPerson.number = number};
        persons.map(person => person.id === personId && (person.number = updatedPerson.number))
    }
})

app.get('/info', (req,res) => {
    const currentDate = new Date().toLocaleString();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    res.send(`<p>The phonebook has info of ${persons.length} people </p>
    <br>
    <p>${currentDate} ${timeZone}</p>`);
});

app.listen(port, () => {
    console.log(`App is listening at port ${port}`);
});