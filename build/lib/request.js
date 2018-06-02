"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
function requestCommon(method, opt, statusCode) {
    return new Promise((resolve, reject) => {
        method(opt, function (error, response, body) {
            if (error)
                return reject(error);
            if (response.statusCode !== statusCode)
                return reject("bad code " + response.statusCode);
            resolve(body);
        });
    });
}
function getAsync(opt, statusCode = 200) {
    return requestCommon(request, opt, statusCode);
}
exports.getAsync = getAsync;
function patchAsync(opt, statusCode = 200) {
    return requestCommon(request.patch, opt, statusCode);
}
exports.patchAsync = patchAsync;
function postAsync(opt, statusCode = 200) {
    return requestCommon(request.post, opt, statusCode);
}
exports.postAsync = postAsync;
//# sourceMappingURL=request.js.map