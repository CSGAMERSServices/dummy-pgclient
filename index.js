const pg = require('pg');
const env = require('env-var');
const winston = require('winston');

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

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
    // var timeout = env.get("EXIT_TIMEOUT", "10000").asString();
    var enableSSL = env.get("ENABLE_SSL", "true").asBool();
    var client = new pg.Client({
        connectionString: conString,
        ssl: enableSSL
        })

    let exitCode;

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

    //
    //
    //
    // client.connect()
    //     .then(function () {
    //         logger.info(`Connection to database ${conString} has been established successfully`);
    //         client.query('SELECT COUNT(*) from users')
    //             .then(res => logger.info(`number of clients in the db = ${res.rows[0]["count"]}`))
    //             .catch(e => logger.error(`Can't query db (connection was established though. Error ${e}`));
    //     })
    //     .catch(err => logger.error(`Failed to connect to database ${conString} with error ${err}`));
    //
    // client.end();

    // client.connect((err, cl) => {
    //     if (err) {
    //         logger.error(`Failed to connect to database ${conString} with error ${err}`);
    //         process.exit(1);
    //     } else {
    //         logger.info(`Connection to database ${conString} has been established successfully`);
    //         cl.query('SELECT COUNT(*) from users')
    //             .then(res => logger.info(`number of clients in the db = ${res.rows[0]["count"]}`))
    //             .catch(e => logger.error(`Can't query db (connection was established though. Error ${e}`));

            // cl.end();

            // cl.query('SELECT COUNT(*) from users', (err, res) => {
            //     if (err) {
            //         logger.error(`Can't query db (connection was established though. Error ${err}`);
            //         cl.end();
            //         setTimeout(exitProcess, timeout, 1)
            //         //process.exit(1);
            //     } else {
            //         logger.info(`number of clients in the db = ${res.rows[0]["count"]}`);
            //         cl.end();
            //         setTimeout(exitProcess, timeout, 0)
            //         // process.exit(0);
            //     }
            // });
    //     }
    // })
}

function exitProcess(exitCode) {
    process.exit(exitCode);
}

async function main() {
    await initializePGConnection();
}

main();
