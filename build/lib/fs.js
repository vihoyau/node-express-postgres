"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const glob = require("glob");
function removeAsync(path) {
    return new Promise(resolve => fs.unlink(path, err => resolve()));
}
exports.removeAsync = removeAsync;
function accessAsync(path, mode = fs.constants.F_OK) {
    return new Promise(resolve => fs.access(path, mode, err => {
        if (err)
            return resolve(false);
        return resolve(true);
    }));
}
exports.accessAsync = accessAsync;
function mkdirAsync(path) {
    return new Promise((resolve, reject) => fs.mkdir(path, err => {
        if (err)
            return reject(err);
        return resolve();
    }));
}
exports.mkdirAsync = mkdirAsync;
function renameAsync(oldPath, newPath) {
    return new Promise((resolve, reject) => fs.rename(oldPath, newPath, err => {
        if (err)
            return reject(err);
        return resolve();
    }));
}
exports.renameAsync = renameAsync;
function readFileAsync(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err)
                return reject(err);
            return resolve(data);
        });
    });
}
exports.readFileAsync = readFileAsync;
function listFilesAsync(pattern, options) {
    return new Promise((resolve, reject) => glob(pattern, options ? options : {}, (err, files) => {
        if (err)
            return reject(err);
        return resolve(files);
    }));
}
exports.listFilesAsync = listFilesAsync;
//# sourceMappingURL=fs.js.map