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
            logger.info(req.session);
            if (token["refresh_token"] === undefined) throw "no refresh";
            db.insertToken(req.session.userid, JSON.stringify(token)).then(()=>{
                res.send("Success");
            });
        }).catch( err => {
            logger.error(err);
            res.send("Fail");
        });
});

router.post("/", (req, res) =>{
    res.status(500).json({ error: "Internal error"});
});

module.exports = router;
