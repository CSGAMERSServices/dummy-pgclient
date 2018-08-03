const pg = require('pg');
const env = require('env-var');
const winston = require('winston');

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
    var conString = env.get("DATABASE_URL").required().asString();
    var enableSSL = env.get("ENABLE_SSL", "true").asBool();
    var client = new pg.Client({
        connectionString: conString,
        ssl: enableSSL
        })

    try {
        await client.connect();
        logger.info(`Successfully connected to the db ${conString}`);

        try {
            try {
                const res = await client.query('SELECT COUNT(*) from users');
                logger.info(`number of clients in the db = ${res.rows[0]["count"]}`);
            } catch (err) {
                logger.error(`Can't query db (connection was established though ${err}`);
            }
        } finally {
            client.end()
                .then(logger.info(`the connection to the db has been closed successfully`))
                .catch(err => logger.error(`failed to gracefully close the client ${err}`))
        }
    }
    catch (err) {
        logger.error(`Can't connect to the db ${conString}. ${err}`);
    }
}

async function main() {
    await initializePGConnection();
}

main();
