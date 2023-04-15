import dayjs from "dayjs";

async function postParticipants(body, res, db) {
    const existingParticipant = await db.collection('participants').findOne({ name: body.name });
    if (existingParticipant) {
        res.status(409).send('user already exists');
        return
    }
    try {
        await db.collection('participants').insertOne({
            name: body.name,
            lastStatus: Date.now()
        });
        await db.collection('messages').insertOne({
            from: body.name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: dayjs(Date.now()).format('HH:mm:ss')
        });
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
            from: req.headers.user,
            to: req.body.to,
            text: req.body.text,
            type: req.body.type,
            time: dayjs(Date.now()).format('HH:mm:ss')
        });
        res.status(201).send('OK');
    } catch (err) {
        res.send(500).send('internal server error');
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

const hooks = {
    postParticipants,
    getParticipants,
    postMessages,
    getMessages
}

export default hooks