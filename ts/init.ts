import express = require("express")
import winston = require("winston")
import { config as logConfig } from "./config/winston"
import { setApplication } from "./lib/global"
import { Sequelize, Options } from "sequelize"
import { pgOpt } from "./config/postgres"
import { run as daemonRun } from "./daemon/daemon"
import redisPool = require("./lib/redispool")
import redisConfig = require("./config/redis")
import { init as modelInit } from "./model/init"

export async function initResource(app: express.Application) {
    // 日志
    winston.configure(logConfig)
    // 为Error添加stack打印函数
    let prototype: any = Error.prototype
    const print = function (logf: Function, e: Error, f: Function, ...args: any[]) {
        logf("%s", e.stack.substring(0, 300))
        if (f)
            f(...args)
    }

    prototype.info = function (f: Function, ...args: any[]) {
        return print(winston.info, this, f, ...args)
    }

    prototype.error = function (f: Function, ...args: any[]) {
        return print(winston.error, this, f, ...args)
    }

    // postgres
    let seqz = new Sequelize(pgOpt.database, pgOpt.username, pgOpt.password, pgOpt.options as Options)

    // redis
    redisPool.init(redisConfig.opt)

    // database model
    await modelInit(seqz)

    app.locals.sequelize = seqz
    setApplication(app)

    winston.info("initResource ok")

    // init daemon
    // daemonRun()

}


import { stat } from "fs"
import { promisify } from "bluebird"

const statAsync = promisify(stat)
import path = require("path")

async function loadRouter(app: express.Application, maps: { cgiPath: string, filePath: string }[]) {
    for (let map of maps) {
        let p = path.join(__dirname, map.filePath) + ".js"
        winston.debug("loading router", p)
        await statAsync(p)
        let m = require(map.filePath)
        app.use(map.cgiPath, m.router)
    }
}

export async function initRouter(app: express.Application) {
    let maps = [
        { cgiPath: "/app/api/user", filePath: "./router/app/user/user" }
    ]
    await loadRouter(app, maps) 
    console.log("initRouter ok")
}
