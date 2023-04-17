import express from 'express';
import cors from 'cors';
import dbSetup from './dataBaseSetup.js';
import hooks from './hooks.js'
const { editMessage, deleteMessage, postParticipants, getParticipants, postMessages, getMessages, postStatus, onlineChecker } = hooks;
import schemas from './joiSetup.js';
const { schemaPostParticipants, schemaPostMessagesBody, schemaPostMessagesHeader, schemaGetMessagesQuery, schemaGetMessagesHeader, schemaPostStatus, schemaDeleteMessagesHeader } = schemas;

const app = express();
app.use(express.json());
app.use(cors());

//dataBase (Mongodb) config.
let db;
dbSetup().then((res) => db = res).catch((err) => console.log(err.message));

setInterval(() => { onlineChecker(db) }, 15000);

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

app.get('/messages', async (req, res) => {
    try {
        await schemaGetMessagesHeader.validateAsync(req.headers);
        let limit = undefined;
        if (req.query.limit) {
            await schemaGetMessagesQuery.validateAsync({ limit: req.query.limit });
            limit = Number(req.query.limit);
        }
        getMessages(req, res, db, limit);
    } catch (err) {
        res.status(422).send(err.message);
    }
});

app.post('/status', async (req, res) => {
    await schemaPostStatus.validateAsync(req.headers)
        .then(() => postStatus(req, res, db))
        .catch((err) => res.status(404).send(err.message))
});

app.delete('/messages/:id', async (req, res) => {
    try {
        await schemaDeleteMessagesHeader.validateAsync(req.headers);
        deleteMessage(req, res, db);
    } catch (err) {
        res.status(422).send(err.message);
    }
});

app.put('/messages/:id', async (req, res) => {
    try {
        await schemaPostMessagesBody.validateAsync(req.body);
        await schemaPostMessagesHeader.validateAsync(req.headers);
        editMessage(req, res, db);
    } catch (err) {
        res.status(422).send(err.message);
    }
});


const PORT = 5000;
app.listen(PORT);