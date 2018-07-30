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

function initializePGConnection() {
    var conString = env.get("DATABASE_URL").required().asString();
    var client = new pg.Client({
        connectionString: conString,
        ssl: true
        })

    client.connect((err, cl) => {
        if (err) {
            logger.error(`Failed to connect to database ${conString} with error ${err}`);
            process.exit(1);
        } else {
            logger.info(`Connection to database ${conString} has been established successfully`);
            cl.query('SELECT COUNT(*) from users', (err, res) => {
                if (err) {
                    logger.error(`Can't query db (connection was established though. Error ${err}`);
                    cl.end();
                    process.exit(1);
                } else {
                    logger.info(`number of clients in the db = ${res.rows[0]["count"]}`);
                    process.exit(0);
                }
            });
        }
    })
}

initializePGConnection();