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
///<reference path="../typings/index.d.ts" />
const logger = require("morgan");
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const init_1 = require("./init");
const winston = require("winston");
const path = require("path");
const app = express();
module.exports = app;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield init_1.initResource(app);
        app.use(logger('dev'));
        app.use(cookieParser());
        app.use(express.static(path.join(__dirname, '../public')));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        // 跨域
        app.all('*', function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*"); // TODO
            res.header("Access-Control-Allow-Headers", "X-Requested-With,token,uuid,content-type");
            res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS,PATCH");
            next();
        });
        yield init_1.initRouter(app);
        app.use(function (req, res, next) {
            res.locals.message = '';
            let err = new Error('Not Found');
            next(err);
        });
        app.use(function (err, req, res, next) {
            res.locals.message = err.message;
            res.locals.error = req.app.get('env') === 'development' ? err : {};
            res.status(err.status || 500);
            res.end();
        });
        process.on("uncaughtException", (err) => {
            winston.error("uncaughtException", err.stack);
        });
    });
}
main();
//# sourceMappingURL=app.js.map