// <---------------------------- Imports ---------------------------->
const express = require('express');
const http = require('http');
const app = express();
let server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const dotenv = require('dotenv');
const cors = require('cors');
const { onConnect, onPart, onDisconnect } = require(__dirname + '/upload/aws');

// <---------------------------- Configuration ---------------------------->
dotenv.config({ path: __dirname + '/config.env' });
app.use(cors());
app.use(express.urlencoded({ limit: '50mb', extended: true }));
require(__dirname + '/global');


// <---------------------------- API ---------------------------->

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


// <---------------------------- Socket ---------------------------->

io.on('connection', (socket) => {
    console.log('a user connected');
    onConnect({ key: 'key', extension: 'wav' });

    socket.on('audio_in', async (buffer) => {
        onPart({ key: 'key', data: buffer });
    });

    socket.on('disconnect', async () => {
        console.log('user disconnected');
        const result = await onDisconnect({ key: 'key', channels: 1, sampleRate: 44100, bitDepth: 16 });
        console.log(result);
    });

    socket.on('error', (err) => {
        console.log('error in socket');
    })

});

// <---------------------------- Listen ---------------------------->
server.listen(3000, () => {
    console.log(`Example app listening on port 3000`)
});