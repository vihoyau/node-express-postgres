"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reqerror_1 = require("../lib/reqerror");
function sendError(res, e) {
    if (e instanceof reqerror_1.ReqError) {
        res.status(e.getCode()).json({ error: e.message });
        return;
    }
    res.status(500).json({ error: e.message });
}
exports.sendError = sendError;
function sendErrMsg(res, msg, code) {
    sendError(res, new reqerror_1.ReqError(msg, code));
}
exports.sendErrMsg = sendErrMsg;
function sendNoPerm(res, msg) {
    sendError(res, new reqerror_1.ReqError(msg ? msg : "没有权限！", 403));
}
exports.sendNoPerm = sendNoPerm;
function sendNotFound(res, msg) {
    sendError(res, new reqerror_1.ReqError(msg ? msg : "资源不存在！", 404));
}
exports.sendNotFound = sendNotFound;
function sendOk(res, data) {
    res.send(JSON.stringify(data));
}
exports.sendOk = sendOk;
function sendOK(res, data) {
    sendOk(res, data);
}
exports.sendOK = sendOK;
function createdOk(res, data) {
    res.statusCode = 201;
    sendOk(res, data);
}
exports.createdOk = createdOk;
function deleteOK(res, data) {
    res.statusCode = 204;
    sendOk(res, data);
}
exports.deleteOK = deleteOK;
//# sourceMappingURL=response.js.map