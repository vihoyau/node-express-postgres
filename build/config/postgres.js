"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pgOpt = {
    database: "wyho",
    username: "wyho",
    password: "",
    options: {
        dialect: "postgres",
        //host: "192.168.0.210",
        //host: "172.33.0.2",
        host: "127.0.0.1",
        //port: 5432,
        port: 5432,
        timezone: "+8:00",
        pool: {
            maxConnections: 5,
            minConnections: 0,
            maxIdleTime: 100000
        }
    }
};
//# sourceMappingURL=postgres.js.map