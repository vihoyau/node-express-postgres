"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xml2js = require("xml2js");
function parseXmlAsync(s) {
    return new Promise((resolve, reject) => {
        xml2js.parseString(s, (err, res) => {
            if (err)
                return reject(err);
            resolve(res);
        });
    });
}
exports.parseXmlAsync = parseXmlAsync;
function buildXml(obj, opt) {
    return new xml2js.Builder(opt).buildObject(obj);
}
exports.buildXml = buildXml;
//# sourceMappingURL=xml.js.map