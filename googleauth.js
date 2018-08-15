const fs = require("fs");
const {google} = require("googleapis");
const path = require("path");

const logger = require("./logger.js");

const scopes = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/calendar.readonly"
];
const auth_path = "../auth_path";
const server_key_path = path.join(__dirname, auth_path+"/client_secret_MCube.json");

class GoogleAuth {
    constructor () {
        this.keys = { redirect_uris: [""]};

        if (fs.existsSync(server_key_path)) this.keys = JSON.parse(fs.readFileSync(server_key_path, "utf8")).installed;
        else logger.error("error server key does not exists");

        this.oAuth2Client = new google.auth.OAuth2(
            this.keys.client_id,
            this.keys.client_secret,
            this.keys.redirect_uris[0]
        );
    }

    getAuthorizeUrl (scopes) {
        return this.oAuth2Client.generateAuthUrl({
            access_type: "offline",
            scope: scopes,
        });
    }

    getToken (code) {
        return new Promise((resolve, reject) => {
            this.oAuth2Client.getToken(code, (err, token) => {
                if (err) reject(err);
                resolve(token);
            });
        });
    }

    saveToken (save_token_path, token) {
        return new Promise((resolve, reject) => {
            fs.writeFile(save_token_path, JSON.stringify(token), (err) =>{
                if (err) return reject(err);
                resolve();  // Save Success
            });
        });
    }
}

module.exports = {GoogleAuth, scopes};
