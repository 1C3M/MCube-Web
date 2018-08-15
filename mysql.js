const mysql = require("mysql2/promise");

const connection_data = {
    host: "localhost",
    user: "mcube",
    password:"mcube",
    database: "mcube"
};
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

    async buildTable () {
        const build_query = [
            "CREATE TABLE IF NOT EXISTS user (\
                user_id VARCHAR(20) NOT NULL, \
                name VARCHAR(50) NOT NULL,\
                pw VARCHAR(255) NOT NULL,\
                PRIMARY KEY(user_id) \
            )",
            "CREATE TABLE IF NOT EXISTS images (\
                uuid BINARY(16) NOT NULL, \
                user_id VARCHAR(20) NOT NULL, \
                filename VARCHAR(255), \
                PRIMARY KEY(uuid), \
                FOREIGN KEY(user_id) REFERENCES user(user_id) \
            )",
            "CREATE TABLE IF NOT EXISTS tokens (\
                uuid BINARY(16) NOT NULL, \
                user_id VARCHAR(20) NOT NULL, \
                google VARCHAR(1000) NOT NULL, \
                PRIMARY KEY(uuid), \
                FOREIGN KEY(user_id) REFERENCES user(user_id)\
            )",
        ];
        try {
            let result = [];
            for(let i = 0; i < build_query.length; i++)
                result.push(await this.connection.execute(build_query[i]));
            return await result;
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
            return await this.connection.execute(select_query, [user_id]);
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
/*
async function build() {
    let testSQLConnect = new MCubeDB();
    let result= [];
    result.push(await testSQLConnect.connect());
    result.push(await testSQLConnect.buildTable());
    result.push(await testSQLConnect.destory());
    return await result;
}*/
//build().then(console.log);


module.exports = { MCubeDB, StatusEnum };
