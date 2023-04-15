import express from 'express';
import cors from 'cors';
import dbSetup from './dataBaseSetup.js';
import hooks from './hooks.js'
const { postParticipants, getParticipants, postMessages } = hooks;
import schemas from './joiSetup.js';
const { schemaPostParticipants, schemaPostMessagesBody, schemaPostMessagesHeader } = schemas;

const app = express();
app.use(express.json());
app.use(cors());

//dataBase (Mongodb) config.
let db;
dbSetup().then((res) => db = res).catch((err) => console.log(err.message));

app.post('/participants', async (req, res) => {
    await schemaPostParticipants.validateAsync(req.body)
        .then(() => postParticipants(req.body, res, db))
        .catch((err) => res.status(422).send(err.message));
});

app.get('/participants', (req, res) => {
    getParticipants(req, res, db);
});

app.post('/messages', async (req, res) => {
    try {
        await Promise.all([
            schemaPostMessagesBody.validateAsync(req.body),
            schemaPostMessagesHeader.validateAsync(req.headers)
        ]);
        postMessages(req, res, db);
    } catch (err) {
        res.status(422).send(err.message);
    }
});


const PORT = 5000;
app.listen(PORT);