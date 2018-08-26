const express = require("express");
const multer = require("multer");
const path = require("path");

const { MCubeDB, StatusEnum } = require("../mysql.js");
const logger = require("../logger.js");
const {GoogleAuth, scopes} = require("../googleauth.js");

const router = express.Router();
const serverAuth = new GoogleAuth();
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "images");
    },
    filename: (req, file, callback) => {
        let extension = path.extname(file.originalname);
        let basename = path.basename(file.originalname, extension);
        callback(null, basename + "-" + Date.now() + extension);
    }
});
let upload = multer({
    storage: storage
});

const db = new MCubeDB();
db.connect();

router.get("/", (req, res) =>{
    res.render("signup", {title:"signup"});
});

router.post("/", upload.array("images", 12), (req, res) => {
    req.session.userid = req.body.userid;
    if (db.status !== StatusEnum.REAEY) {
        db.connect();
    }
    try {
        db.insertUser(req.body.userID, req.body.password, req.body.name, req.body.email);
        req.files.forEach( file => {
            logger.info([req.body.userid, file.filename]);
            db.insertImage(req.body.userid, file.filename);
        });
    } catch (err) {
        logger.error(err);
    }
    res.redirect(serverAuth.getAuthorizeUrl(scopes));
});

module.exports = router;
