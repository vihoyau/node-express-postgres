"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis = require("redis");
const events = require("events");
const bluebird = require('bluebird');
bluebird.promisifyAll(redis.Multi.prototype);
bluebird.promisifyAll(redis.RedisClient.prototype);
var redis_1 = require("redis");
exports.RedisClient = redis_1.RedisClient;
function sleep(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
}
class MyRedisClient {
    constructor(opt = {}) {
        this.opt = opt;
        this.idle = false;
        this.emitter = new events.EventEmitter();
        this.createRedisClient();
    }
    createRedisClient() {
        let [self, emitter, opt] = [this, this.emitter, this.opt];
        const createNew = function () {
            let client = redis.createClient(opt);
            // client.on("connect", () => p("connect", idx))
            // client.on("reconnecting", e => p("reconnecting", e.toString()))
            // 连接已经可用
            client.on("ready", () => {
                if (self.client)
                    throw new Error("logical error");
                self.idle = true;
                self.client = client;
                emitter.emit("ready");
            });
            // 连接出错
            client.on("error", e => {
                client.end(true);
            });
            // 连接断开
            client.on("end", () => {
                client.end(true);
                self.client = undefined;
                self.idle = false;
                emitter.emit("restart", 1000);
            });
        };
        emitter.on("restart", (ms = 0) => __awaiter(this, void 0, void 0, function* () {
            yield sleep(ms);
            if (self.client)
                throw new Error("logical error");
            createNew();
        }));
        emitter.emit("restart");
    }
    getRedisClient(timeout = 5000) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            // 如果空闲连接，直接返回
            if (self.idle) {
                self.idle = false; // 设置状态忙
                return self.client;
            }
            // 等待连接空闲
            const getIdleClient = () => __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve, reject) => {
                    let on_ready;
                    let emitter = self.emitter;
                    // 超时返回
                    const id = setTimeout(() => {
                        emitter.removeListener("ready", on_ready); // 取消ready事件监听
                        reject(new Error("timeout"));
                    }, timeout);
                    // 有空闲连接
                    on_ready = () => {
                        clearTimeout(id); // 取消超时定时器
                        emitter.removeListener("ready", on_ready); // 取消ready事件监听
                        self.idle = false; // 设置状态忙
                        return resolve(self.client);
                    };
                    emitter.on("ready", on_ready);
                });
            });
            return yield getIdleClient();
        });
    }
    release() {
        if (this.idle)
            return;
        this.idle = true; // 设置状态空闲
        this.emitter.emit("ready"); // 发布空闲事件
    }
}
let clientOptions;
let redisClientMap;
function init(opt) {
    if (clientOptions) {
        throw new Error("alreay init RedisPool!");
    }
    clientOptions = JSON.stringify(opt);
    redisClientMap = new Map();
}
exports.init = init;
function getRedisClientAsync(cb, opt) {
    return __awaiter(this, void 0, void 0, function* () {
        const [db, timeout] = [opt.db != 0 && !opt.db ? 0 : opt.db, !opt.timeout ? 5000 : opt.timeout];
        let myClient;
        if (!redisClientMap.has(db)) {
            let opt = JSON.parse(clientOptions);
            opt.db = db;
            redisClientMap.set(db, new MyRedisClient(opt));
        }
        myClient = redisClientMap.get(db);
        let client;
        try {
            client = yield myClient.getRedisClient(timeout);
            return yield cb(client);
        }
        catch (e) {
            throw e;
        }
        finally {
            if (client) {
                myClient.release();
            }
        }
    });
}
exports.getRedisClientAsync = getRedisClientAsync;
/*
async function test4() {
    redisPool.init({ host: "192.168.1.118" })
    const f = async (i: number) => {
        let opt = { db: i }
        const key = "key_" + i
        while (true) {
            try {
                let r = await redisPool.getRedisClientAsync(async function (client) {
                    await sleep(1000)
                    return await client.getAsync(key)
                }, opt)

                p(key, r)
                let count = Number.parseInt(r)
                r = await redisPool.getRedisClientAsync(async function (client) {
                    await sleep(1000)
                    return await client.setAsync(key, count + 1)
                }, opt)
            } catch (e) {
                p(key, e.toString())
            }
            await sleep(1000)
        }
    }

    for (let i = 0; i < 3; i++) {
        f(i)
    }
}

async function test3() {
    redisPool.init({ host: "192.168.1.119" })
    const f = async (i: number) => {
        let opt = { db: i }
        while (true) {
            try {
                const key = "key_" + i
                let r = await redisPool.getRedisClientAsync(async function (client: redisPool.RedisClient) {
                    return await (<any>client).multi([
                        ["get", key],
                        ["incr", key],
                        ["get", key]
                    ]).execAsync()
                }, opt)
                p(r)
            } catch (e) {
                p(e.toString())
            }
            await sleep(1000)
        }
    }

    for (let i = 0; i < 1; i++) {
        f(i)
    }
    await sleep(1000000)
}
*/ 
//# sourceMappingURL=redispool.js.map