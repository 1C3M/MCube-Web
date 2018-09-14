const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const PythonShell = require("python-shell");

const { MCubeDB, StatusEnum } = require("../mysql.js");
const logger = require("../logger.js");
const {GoogleAuth, scopes} = require("../googleauth.js");

const configFilename = "config.json";
if(!fs.existsSync(configFilename)){
    throw `No Config File ${configFilename}`;
}

const configData = JSON.parse(fs.readFileSync(configFilename, "utf-8"));

const encodingPy = configData.faceRec.encodingPy;
const scriptPath = configData.faceRec.scriptPath;
const pythonPath = configData.faceRec.pythonPath;
const npyPath = configData.faceRec.npyPath;
const imagesPath = configData.images.path;

const router = express.Router();
const serverAuth = new GoogleAuth();
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, imagesPath);
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
    req.session.userID = req.body.userID;
    if (db.status !== StatusEnum.READY) {
        db.connect();
    }
    try {
        db.insertUser(req.body.userID, req.body.password, req.body.name, req.body.email);
        req.files.forEach( file => {
            logger.info([req.body.userID, file.filename]);

            db.insertImage(req.body.userID, file.filename).then( () => {
                let filepath = path.join(imagesPath, file.filename);
                let pyshell = new PythonShell(encodingPy, {pythonPath:pythonPath, scriptPath:scriptPath});

                pyshell.send(`${path.join(npyPath, req.body.userID)}`);
                pyshell.send(`${filepath}`);

                pyshell.on("message", message => {
                    logger.info(message);
                });
                pyshell.on("stderr", error => {
                    logger.error(error);
                });
            });
        });
    } catch (err) {
        logger.error(err);
    }
    res.redirect(serverAuth.getAuthorizeUrl(scopes));
});

module.exports = router;
