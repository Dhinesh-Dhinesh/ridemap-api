const functions = require("firebase-functions");

const verifyKey = (req, res, next) => {
    const accessKey = req.headers["access-key"];
    if (accessKey === process.env.ACCESS_KEY) {
        next();
    } else {
        functions.logger.warn("**** Unauthorized access attempt ****");
        res.status(401).send("Unauthorized");
    }
};

exports.verifyKey = verifyKey;