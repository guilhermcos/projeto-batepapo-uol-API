import dayjs from "dayjs";

async function postParticipants(body, res, db) {
    const existingParticipant = await db.collection('participants').findOne({ name: body.name })
    if (existingParticipant) {
        res.status(409).send("user already exists")
        return
    }
    try {
        await db.collection('participants').insertOne({
            name: body.name,
            lastStatus: Date.now()
        })
        await db.collection('messages').insertOne({
            from: body.name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: dayjs(Date.now()).format('HH:mm:ss')
        })
        res.status(201).send('ta funcionando');
    } catch {
        res.status(500).send('não funcionou');
    }
}


const hooks = {
    postParticipants
}

export default hooks