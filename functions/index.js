const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

const app = express();
app.use(express.json());
app.use(cors({ origin: ['https://ridemap.in', 'https://mvit.ridemap.in', 'https://smvec.ridemap.in', 'https://mec.ridemap.in'] }));

// checks email in firestore database in allowedemail collection
app.get('/', (req, res) => {
    const email = req.query.email;
    const docRef = db.collection('allowedemails').doc("email");
    docRef.get().then(doc => {
        if (!doc.exists) {
            res.send({
                error: "No such document!"
            });
        } else {
            const data = doc.data();
            if (data.emails.includes(email)) {
                res.send({
                    message: "Email is allowed",
                    isEmailAllowed: true
                });
            } else {
                res.send({
                    message: "Email is not allowed",
                    isEmailAllowed: false
                });
            }
        }
    }).catch(err => {
        console.log('Error getting document', err);
    });
});

app.post('/subscribe', async (req, res) => {
    const topicName = req.body.topicName;
    const uid = req.body.uid;

    const tokens = await db.collection('users').doc(uid).get().then(doc => {
        if (!doc.exists) {
            res.send({
                error: "No such document!"
            });
        } else {
            const data = doc.data();
            console.log(data.token);
            return data.token;
        }
    }).catch(err => {
        console.log('Error getting document', err);
    });

    try {
        messaging.subscribeToTopic(tokens, `/topics/${topicName}`).then((response) => {
            if (response.failureCount > 0) {
                const tokenRef = db.collection('users').doc(uid);

                if (response.errors) {
                    response.errors.forEach((error) => {
                        if (error.error.code === 'messaging/registration-token-not-registered' || "messaging/invalid-registration-token") {
                            tokenRef.update({
                                token: admin.firestore.FieldValue.arrayRemove(tokens[error.index])
                            });
                        }
                    });
                }
            }
            res.status(200).send("ok");
        }).catch((error) => {
            console.log(error);
        });
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});


app.post('/unsubscribe', async (req, res) => {
    const topicName = req.body.topicName;
    const uid = req.body.uid;

    const tokens = await db.collection('users').doc(uid).get().then(doc => {
        if (!doc.exists) {
            res.send({
                error: "No such document!"
            });
        } else {
            const data = doc.data();
            console.log(data.token);
            return data.token;
        }
    }).catch(err => {
        console.log('Error getting document', err);
    });


    messaging.unsubscribeFromTopic(tokens, `/topics/${topicName}`).then((response) => {
        if (response.failureCount > 0) {
            const tokenRef = db.collection('users').doc(uid);

            if (response.errors) {
                response.errors.forEach((error) => {
                    if (error.error.code === 'messaging/registration-token-not-registered' || "messaging/invalid-registration-token") {
                        tokenRef.update({
                            token: admin.firestore.FieldValue.arrayRemove(tokens[error.index])
                        });
                    }
                });
            }
        }
        res.status(200).send("ok");
    }).catch((error) => {
        console.log(error);
    });

});


exports.checkemail = functions.https.onRequest(app);
