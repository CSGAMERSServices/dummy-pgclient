const pg = require('pg');
const env = require('env-var');
const winston = require('winston');
const typeorm = require('typeorm');

const logger = winston.createLogger({
    level: 'silly',
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.splat(),
        winston.format.simple()
    ),
    transports: [
        new winston.transports.Console()
    ]
});

async function initializePGConnection() {
    const conString = env.get("DATABASE_URL").required().asString();
    const enableSSL = env.get("ENABLE_SSL", "true").asBool();

    typeorm.createConnection({
        type: 'postgres',
        url: conString,
        // entities: [__dirname + '/../app/database/records/*'],
        logging: 'error',
        extra: {
            ssl: enableSSL
        }
    }).then(async function (connection) {
        logger.info(`Connection to ${conString} established successfully.`);

        // read the entities

        await connection.close();
        logger.info(`Connection closed`);
    }).catch(function (err) {
        logger.error(`Can't connect to the db ${conString}. ${err}`);
    });
}

async function main() {
    await initializePGConnection();
}

main();
