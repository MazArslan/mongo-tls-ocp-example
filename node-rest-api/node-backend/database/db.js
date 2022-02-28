const dotenv = require('dotenv');
dotenv.config({path:__dirname+'/./../.env'});
module.exports = {
    db: process.env.MONGO_URL,
    ca: process.env.TLS_CA_FILE,
    cert : process.env.TLS_CERT_KEY_FILE
}