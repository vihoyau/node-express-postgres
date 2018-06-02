"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston = require("winston");
const moment = require("moment");
const [Console, File] = [winston.transports.Console, winston.transports.File];
// https://www.npmjs.com/package/winston
// { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
const logdir = "logs";
function timestamps(date) {
    if (date)
        return moment(date).format("YYYY-MM-DD HH:mm:ss");
    return moment().format("YYYY-MM-DD HH:mm:ss");
}
exports.timestamps = timestamps;
function timestamptype(date) {
    return moment(date).format("YYYY.MM.DD HH:mm:ss");
}
exports.timestamptype = timestamptype;
function timestamp() {
    return moment().format("YYYYMMDD HH:mm:ss");
}
exports.config = {
    transports: [
        new Console({
            level: "silly",
            timestamp: timestamp
        }),
        new File({
            json: false,
            filename: `${logdir}/debug.log`,
            name: "debug-file",
            maxFiles: 2,
            maxsize: 1024 * 1024,
            // zippedArchive: true,
            level: "debug",
            tailable: true,
            timestamp: timestamp
        }),
        new File({
            json: false,
            filename: `${logdir}/warn.log`,
            name: "warn-file",
            maxFiles: 2,
            maxsize: 1024 * 1024,
            // zippedArchive: true,
            level: "warn",
            tailable: true,
            timestamp: timestamp
        })
    ],
    exceptionHandlers: [
        new File({
            filename: `${logdir}/exceptions.log`,
        })
    ]
};
//# sourceMappingURL=winston.js.map