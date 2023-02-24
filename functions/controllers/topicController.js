const admin = require("firebase-admin");
const db = admin.firestore();
const messaging = admin.messaging();

// subscribe to topic
const subscribe = async (req, res) => {
    const topicName = req.body.topicName;
    const uid = req.body.uid;

    const tokens = await db.collection('users').doc(uid).get().then(doc => {
        if (!doc.exists) {
            res.send({
                error: "No such document!"
            });
        } else {
            const data = doc.data();
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

            // add uid to subscribers array in analytics collection
            db.collection('analytics').doc("topics").update({
                [topicName]: admin.firestore.FieldValue.arrayUnion(uid)
            });

            res.status(200).send("ok");
        }).catch((error) => {
            console.log(error);
        });
    } catch (err) {
        console.log(err);
        res.send(err);
    }
}

// unsubscribe from topic
const unsubscribe = async (req, res) => {
    const topicName = req.body.topicName;
    const uid = req.body.uid;

    const tokens = await db.collection('users').doc(uid).get().then(doc => {
        if (!doc.exists) {
            res.send({
                error: "No such document!"
            });
        } else {
            const data = doc.data();
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

        // remove uid from subscribers array in analytics collection
        db.collection('analytics').doc("topics").update({
            [topicName]: admin.firestore.FieldValue.arrayRemove(uid)
        });

        res.status(200).send("ok");
    }).catch((error) => {
        console.log(error);
    });

}


// send to topic
const sendToTopic = (req, res) => {
    const topicName = req.body.topicName;
    const title = req.body.title;
    const body = req.body.body;

    const payload = {
        notification: {
            title: title,
            body: body,
            sound: "default"
        }
    };

    const options = {
        priority: 'high',
        timeToLive: 60 * 60 * 24 // 1 day
    };

    messaging.sendToTopic(`/topics/${topicName}`, payload, options).then((response) => {
        res.status(200).send(response);
    }).catch((error) => {
        console.log(error);
        res.status(404).send(error);
    });
}

//! Exports
exports.subscribe = subscribe;
exports.unsubscribe = unsubscribe;
exports.sendToTopic = sendToTopic;