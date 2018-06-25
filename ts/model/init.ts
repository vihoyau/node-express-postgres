import { Sequelize } from "sequelize"
import { promisify } from "bluebird"
import * as assert from "assert"
import * as log from "winston"
import { stat } from "fs"
const statAsync = promisify(stat)
import path = require("path")

export async function init(seqz: Sequelize) {
    // let models = [
    //     "./user/user"
    // ]
    // try {
    //     for (let modelPath of models) {
    //         let p = path.join(__dirname, modelPath) + ".js"
    //         log.debug("loading model", p)
    //         await statAsync(p)
    //         let m = require(modelPath)
    //         assert(m.defineFunction, "miss defineFunction")
    //         seqz.import(modelPath, m.defineFunction)
    //     }
    // } catch (e) {
    //     log.error("init model fail ", e.message)
    //     process.exit(1)
    // }
}