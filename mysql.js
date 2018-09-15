const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");

const configfile = "config.json";
if (!fs.existsSync(configfile)){
    throw "File Does Not Exist";
}

const configdata = JSON.parse(fs.readFileSync(configfile, "utf-8"));
const connection_data = configdata.database;
const database = connection_data.database;
const username = connection_data.username;
const password = connection_data.password;
const sequelize = new Sequelize(database, username, password, {dialect: "mysql"});



let StatusEnum = {
    CREATED: 0,
    READY: 1,
    ERROR: 2,
    CLOSED: 3,
};

class MCubeDB {
    constructor () {
        this.User = sequelize.define("users", {
            user_id: Sequelize.STRING,
            pw : Sequelize.STRING,
            name : Sequelize.STRING,
            email : Sequelize.STRING
        });

        this.Image = sequelize.define("images", {
            filename : Sequelize.STRING,
            user_id: Sequelize.STRING
        });

        this.Token = sequelize.define("tokens", {
            google: Sequelize.TEXT,
            mm: Sequelize.STRING,
            user_id: Sequelize.STRING
        });

        this.status = StatusEnum.CREATED;
        this.message = "created";
    }
    async getUserIDFromMMToken( token="" ) {
        try {
            let data = await this.Token.findOne({where: {mm: token}});
            return await data.user_id;
        } catch (err) {
            this.status = StatusEnum.ERROR;
            this.message = err;
            return err;
        }
    }

    async getGoogleTokenFromUserID ( user_id="" ) {
        try {
            let data = await this.Token.findOne({where: {user_id: user_id}});
            return await data.google;
        } catch (err) {
            this.status = StatusEnum.ERROR;
            this.message = err;
            return err;
        }
    }

    async insertUser ( user_id="", pw="", name="" , email="") {
        try {
            await this.User.create({user_id: user_id, pw: pw, name: name, email: email});
            return await 0;
        } catch (err) {
            this.status = StatusEnum.ERROR;
            this.message = err;
            throw err;
        }
    }

    async updateMMToken ( user_id="", token="" ){
        try {
            let willBeUpdated = await this.Token.findOne({user_id : user_id});
            await willBeUpdated.update({mm: token });
        } catch (err) {
            this.status = StatusEnum.ERROR;
            this.message = err;
            throw err;
        }
    }

    async insertToken ( user_id="", token="" ) {
        try {
            await this.Token.create({user_id: user_id, google:token});
            return 0;
        } catch (err) {
            this.status = StatusEnum.ERROR;
            this.message = err;
            return err;
        }
    }

    async insertImage ( user_id="", filename="" ) {
        try {
            await this.Image.create({user_id: user_id, filename: filename});
            return 0;
        } catch (err) {
            this.status = StatusEnum.ERROR;
            this.message = err;
            return err;
        }
    }
}

let MCubedb = new MCubeDB();

module.exports = { MCubedb, StatusEnum };

