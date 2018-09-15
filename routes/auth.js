const express = require("express");
const {GoogleAuth} = require("../googleauth.js");
const {MCubedb, StatusEnum} = require("../mysql.js");
const logger = require("../logger.js");

const router = express.Router();

const userAuth = new GoogleAuth();
router.get("/", (req, res) => {
    userAuth.getToken(req.query.code)
        .then( token => {
            logger.info(req.session);
            if (token["refresh_token"] === undefined) throw "no refresh";
            MCubedb.insertToken(req.session.userID, JSON.stringify(token)).then(()=>{
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
