import dayjs from "dayjs";
import Joi from "joi";
import { stripHtml } from "string-strip-html";
import schemas from "./joiSetup.js";
import { ObjectId } from "bson";
const { schemaTrim } = schemas;

async function postParticipants(body, res, db) {
    const existingParticipant = await db.collection('participants').findOne({ name: body.name });
    if (existingParticipant) {
        res.status(409).send('user already exists');
        return
    }
    try {
        await Promise.all([
            db.collection('participants').insertOne({
                name: stripHtml(schemaTrim.validate(body.name).value).result,
                lastStatus: Date.now()
            }),
            db.collection('messages').insertOne({
                from: stripHtml(schemaTrim.validate(body.name).value).result,
                to: 'Todos',
                text: 'entra na sala...',
                type: 'status',
                time: dayjs(Date.now()).format('HH:mm:ss')
            })
        ])
        res.status(201).send('OK');
    } catch {
        res.status(500).send('internal server error');
    }
}

async function getParticipants(req, res, db) {
    try {
        const allParticipants = await db.collection('participants').find().toArray();
        res.status(200).send(allParticipants);
    } catch (err) {
        console.log(err);
        res.status(500).send('internal server error');
    }
}

async function postMessages(req, res, db) {
    const existingParticipant = await db.collection('participants').findOne({ name: req.headers.user });
    if (!existingParticipant) {
        res.status(422).send('user not registered');
        return
    }
    try {
        await db.collection('messages').insertOne({
            from: stripHtml(schemaTrim.validate(req.headers.user).value).result,
            to: stripHtml(schemaTrim.validate(req.body.to).value).result,
            text: stripHtml(schemaTrim.validate(req.body.text).value).result,
            type: stripHtml(req.body.type).result,
            time: dayjs(Date.now()).format('HH:mm:ss')
        });
        res.status(201).send('OK');
    } catch (err) {
        res.status(500).send('internal server error');
    }
}

async function getMessages(req, res, db, limit) {
    try {
        const messageRequeriments = {
            $or: [
                { from: req.headers.user },
                { to: req.headers.user },
                { to: "Todos" }
            ]
        }
        const messages = await db.collection('messages').find(messageRequeriments).sort({ _id: -1 }).limit(limit || 0).toArray(); // limit = 0 é o padrão
        res.status(200).send(messages);
    } catch (err) {
        res.status(500).send(err);
    }
}

async function postStatus(req, res, db) {
    try {
        const existingParticipant = await db.collection('participants').findOne({ name: req.headers.user });
        if (!existingParticipant) {
            return res.status(404).send('user not registered');
        }
        const editedParticipant = {
            name: req.headers.user,
            lastStatus: Date.now()
        };
        await db.collection('participants').updateOne({ name: req.headers.user }, { $set: editedParticipant });
        res.status(200).send('OK');
    } catch (err) {
        res.status(500).send(err);
    }
};

async function onlineChecker(db) {
    const tenSecAgo = Date.now() - 10000;
    try {
        const timedOutParticipants = await db.collection('participants').find({ lastStatus: { $lt: tenSecAgo } }).toArray();
        if (timedOutParticipants.length === 0) {
            return
        }
        timedOutParticipants.map(async (participant) => {
            await db.collection('participants').deleteOne({ _id: participant._id })
            await db.collection('messages').insertOne({
                from: participant.name,
                to: 'Todos',
                text: 'sai da sala...',
                type: 'status',
                time: dayjs(Date.now()).format('HH:mm:ss')
            });
        })
    } catch (err) {
        console.log(err.message);
    }
}

async function deleteMessage(req, res, db) {
    const { id } = req.params;
    try {
        const message = await db.collection('messages').findOne({ _id: new ObjectId(id) });
        if (message === null) {
            res.status(404).send('message not found');
            return;
        } else if (message.from !== req.headers.user) {
            res.status(401).send('UNAUTHORIZED');
        }
        await db.collection('messages').deleteOne({ _id: new ObjectId(id) });
        res.status(200).send('message deleted');
    } catch (err) {
        res.status(500).send('internal server error');
    }
}

async function editMessage(req, res, db) {
    const { id } = req.params;
    try {
        const message = await db.collection('messages').findOne({ _id: new ObjectId(id) });
        if (message === null) {
            res.status(404).send('message not found');
            return;
        } else if (message.from !== req.headers.user) {
            res.status(401).send('UNAUTHORIZED');
            return;
        }
        const editedMessage = {
            from: message.from,
            to: stripHtml(schemaTrim.validate(req.body.to).value).result,
            text: stripHtml(schemaTrim.validate(req.body.text).value).result,
            type: stripHtml(schemaTrim.validate(req.body.type).value).result,
            time: message.time
        }
        await db.collection('messages').updateOne({ _id: new ObjectId(id) }, { $set: editedMessage });
        res.status(200).send('message edited');
    } catch (err) {
        res.status(500).send('internal server error');
    }

}

const hooks = {
    postParticipants,
    getParticipants,
    postMessages,
    getMessages,
    postStatus,
    onlineChecker,
    deleteMessage,
    editMessage
}

export default hooks