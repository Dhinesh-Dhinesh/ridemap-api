const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();

const app = express();
app.use(express.json());
app.use(cors({ origin: ['https://ridemap.in', 'https://mvit.ridemap.in', 'https://smvec.ridemap.in', 'https://mec.ridemap.in'] }));

const { email } = require('./controllers/emailController');
const { subscribe, unsubscribe, sendToTopic } = require('./controllers/topicController');

app.get('/email', email);
app.post('/subscribe', subscribe);
app.post('/unsubscribe', unsubscribe);
app.post('/sendToTopic', sendToTopic);

exports.api = functions.https.onRequest(app);