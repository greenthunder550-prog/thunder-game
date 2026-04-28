const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

// --- الإعدادات النهائية ---
let tiktokUsername = "noureddinethunder"; 
let targetPoints = 200; // هدف الفوز

const countries = {
    1: { name: "الجزائر", trigger: "جز", gift: "Lighttning Bolt.png", points: 0 },
    2: { name: "المغرب", trigger: "مغ", gift: "Ice Crea; Cone.png", points: 0 },
    3: { name: "تونس", trigger: "تو", gift: "GG.png", points: 0 },
    4: { name: "مصر", trigger: "مص", gift: "Freestyle.png", points: 0 },
    5: { name: "ليبيا", trigger: "لي", gift: "Give It ALL.png", points: 0 },
    6: { name: "قطر", trigger: "قط", gift: "Wink wink", points: 0 }
};

let tiktokChat = new WebcastPushConnection(tiktokUsername);

tiktokChat.connect().then(state => {
    console.log(`✅ تم الاتصال بنجاح بحساب: ${tiktokUsername}`);
}).catch(err => {
    console.error("❌ فشل الاتصال! تأكد أن البث شغال حالياً.");
});

// استقبال التعليقات (+1 نقطة)
tiktokChat.on('chat', data => {
    let msg = data.comment.toLowerCase();
    for (let id in countries) {
        if (msg.startsWith(countries[id].trigger)) {
            countries[id].points += 1;
            io.emit('update', { id: id, points: countries[id].points });
            checkWinner(id);
        }
    }
});

// استقبال الهدايا (+5 نقاط)
tiktokChat.on('gift', data => {
    for (let id in countries) {
        if (data.giftName === countries[id].gift) {
            countries[id].points += 5;
            io.emit('update', { id: id, points: countries[id].points });
            checkWinner(id);
        }
    }
});

function checkWinner(id) {
    if (countries[id].points >= targetPoints) {
        io.emit('winner', { name: countries[id].name });
        for (let i in countries) countries[i].points = 0;
    }
}

server.listen(3000, () => {
    console.log('🚀 السيرفر شغال الآن على: http://localhost:3000');
});

