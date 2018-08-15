const express = require("express");
const {GoogleAuth} = require("../googleauth.js");
const {MCubeDB, StatusEnum} = require("../mysql.js");
const logger = require("../logger.js");

const router = express.Router();

const db = new MCubeDB();
const userAuth = new GoogleAuth();
db.connect();
router.get("/", (req, res) => {
    if (db.status !== StatusEnum.READY) {
        db.connect();
    }
    userAuth.getToken(req.query.code)
        .then( token => {
            logger.info(JSON.stringify(token));
            db.insertToken(req.session.user_id, JSON.stringify(token));
        }).catch( err => {
            logger.error("auth.js 19"+err);
        });
    res.send("Success");
});

router.post("/", (req, res) =>{
    res.status(500).json({ error: "Internal error"});
});

module.exports = router;
