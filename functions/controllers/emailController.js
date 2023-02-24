const admin = require("firebase-admin");
const db = admin.firestore();

const email = (req, res) => {
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
};

//! Exports
exports.email = email;