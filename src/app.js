import express from 'express';
import cors from 'cors';
import dbSetup from './dataBaseSetup.js';


const app = express();
app.use(express.json());
app.use(cors());

//dataBase (Mongodb) config.
let db;
dbSetup().then((res) => db = res).catch((err) => console.log(err.message));

app.post('/participants', async (req, res) => {
    db.collection('irmaoDoJorel').insertOne({ nome: "irmão do jorel", idade: "desconhecida" }).then(() => {
        res.send('ta funcionando');
    }).catch((err) => {
        res.send('não funcionou');
    })
})

app.get('/participants', (req, res) => {

})


const PORT = 5000;
app.listen(PORT);