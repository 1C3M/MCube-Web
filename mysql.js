const mysql = require("mysql2/promise");
const fs = require("fs");

const configfile = "config.json";
if (!fs.existsSync(configfile)){
    throw "File Does Not Exist";
}

const configdata = JSON.parse(fs.readFileSync(configfile, "utf-8"));
const connection_data = configdata.database;

let StatusEnum = {
    CREATED: 0,
    REAEY: 1,
    ERROR: 2,
    CLOSED: 3,
};

class MCubeDB {
    constructor () {
        this.status = StatusEnum.CREATED;
        this.message = "created";
    }

    async connect () {
        try {
            this.connection = await mysql.createConnection(connection_data);
            this.status = StatusEnum.REAEY;
            return this.conection;
        } catch (err) {
            this.status = StatusEnum.ERROR;
            this.message = err;
            return err;
        }
    }

    async destory () {
        try {
            this.connection.end();
            this.status = StatusEnum.CLOSED;
            return 1;
        } catch (err) {
            this.status = StatusEnum.ERROR;
            this.message = err;
            return err;
        }
    }

    async ping () {
        try {
            return await this.connection.excute("SELECT 1");
        } catch (err) {
            this.status = StatusEnum.ERROR;
            this.message = err;
            return err;
        }
    }

    async getImagesFromUserId ( user_id="" ) {
        const select_query = "SELECT data FROM images WHERE user_id=?";
        try {
            return await this.connection.execute(select_query, [user_id]);
        } catch (err) {
            this.status = StatusEnum.ERROR;
            this.message = err;
            return err;
        }
    }

    async getUserNameFromUserId ( user_id="" ) {
        const select_query = "SELECT name FROM user WHERE user_id=?";
        try {
            return await this.connection.execute(select_query, [user_id]);
        } catch (err) {
            this.status = StatusEnum.ERROR;
            this.message = err;
            return err;
        }
    }

    async getGoogleTokenFromUserID ( user_id="" ) {
        const select_query = "SELECT google FROM tokens WHERE user_id=?";
        try {
            return (await this.connection.execute(select_query, [user_id]))[0][0].google;
        } catch (err) {
            this.status = StatusEnum.ERROR;
            this.message = err;
            return err;
        }
    }

    async insertUser ( user_id="", pw="", name="" ) {
        const insert_query = "INSERT INTO user(user_id, pw, name) VALUES(?, ?, ?)";
        try {
            return await this.connection.execute(insert_query, [user_id, pw, name]);
        } catch (err) {
            this.status = StatusEnum.ERROR;
            this.message = err;
            return err;
        }
    }

    async insertToken ( user_id="", token="" ) {
        const insert_query = "INSERT INTO tokens(uuid, user_id, google) \
            VALUES(UNHEX(REPLACE(UUID(), '-', '')), ?, ?)";
        try {
            return await this.connection.execute(insert_query, [user_id, token]);
        } catch (err) {
            this.status = StatusEnum.ERROR;
            this.message = err;
            return err;
        }
    }

    async insertImage ( user_id="", filename="" ) {
        const insert_query = "INSERT INTO images(uuid, user_id, filename) \
            VALUES(UNHEX(REPLACE(UUID(), '-', '')), ?, ?)";
        try {
            return await this.connection.execute(insert_query, [user_id, filename]);
        } catch (err) {
            this.status = StatusEnum.ERROR;
            this.message = err;
            return err;
        }
    }

    async insertData ( user_id="", pw="", name="", filename="" ) {
        try {
            const resultUser = await this.insertUser(user_id, pw, name);
            const resultImage = await this.insertImage(user_id, filename);
            return [resultUser, resultImage];
        } catch (err) {
            this.status = StatusEnum.ERROR;
            this.message = err;
            return err;
        }
    }
}

module.exports = { MCubeDB, StatusEnum };
