const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
require('dotenv').config();

admin.initializeApp();

const app = express();
app.use(express.json());
app.use(cors({ origin: ['https://ridemap.in', 'https://mvit.ridemap.in', 'https://smvec.ridemap.in', 'https://mec.ridemap.in'] }));

// controllers

const { email } = require('./controllers/emailController');
const { subscribe, unsubscribe, sendToTopic } = require('./controllers/topicController');

// middleware

const { verifyKey } = require('./middleware/accessMiddleware');

app.get('/email', verifyKey, email);
app.post('/subscribe', verifyKey, subscribe);
app.post('/unsubscribe', verifyKey, unsubscribe);
app.post('/sendToTopic', verifyKey, sendToTopic);

exports.api = functions.https.onRequest(app);