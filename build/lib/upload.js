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
const path = require("path");
const multiparty_1 = require("multiparty");
/*{
     "err": null,
     "files": {
         "image": [
             {
                 "fieldName": "image",
                 "originalFilename": "users.test.js",
                 "path": "public\\files\\kQpp43xBiszHPGmXdt9qfadP.js",
                 "headers": {
                     "content-disposition": "form-data; name=\"image\"; filename=\"users.test.js\"",
                     "content-type": "application/javascript"
                 },
                 "size": 1420
             }
         ]
     },
     "fields": {
         "image": [
             {
                 "fieldName": "image",
                 "originalFilename": "users.test.js",
                 "path": "public\\files\\kQpp43xBiszHPGmXdt9qfadP.js",
                 "headers": {
                     "content-disposition": "form-data; name=\"image\"; filename=\"users.test.js\"",
                     "content-type": "application/javascript"
                 },
                 "size": 1420
             }
         ]
     },
     "status": 0
 }*/
const fs_1 = require("./fs");
function uploadOneFile(req, fieldName, opt) {
    return new Promise((resolve, reject) => {
        let form = new multiparty_1.Form(opt);
        form.parse(req, (err, fields, files) => __awaiter(this, void 0, void 0, function* () {
            if (err)
                return reject(err);
            // 上传名字是否正确
            let fileInfoArr = files[fieldName];
            if (fileInfoArr && fileInfoArr.length == 1) {
                return resolve(fileInfoArr[0]);
            }
            for (let k in files) {
                for (let kk in files[k]) {
                    let m = files[k][kk];
                    yield fs_1.removeAsync(m.path); //删除非法临时文件
                }
            }
            reject("invalid files");
        }));
    });
}
function uploadinfoMediaAsync(req, opt) {
    return __awaiter(this, void 0, void 0, function* () {
        let dir = `${opt.targetDir}`;
        // 创建目录
        if (!(yield fs_1.accessAsync(dir)))
            yield fs_1.mkdirAsync(dir);
        // 广告目录下的照片数量是否超限
        let files = yield fs_1.listFilesAsync(`${dir}/${opt.glob}`);
        if (files.length >= opt.maxFiles)
            throw new Error("too many files");
        // 上传单张照片
        let fileInfo = yield uploadOneFile(req, opt.fieldName, { uploadDir: opt.tmpDir, maxFields: 1, maxFilesSize: opt.maxSize });
        // 后缀
        let tmpPath = fileInfo.path;
        let extname = path.extname(tmpPath);
        let find = false;
        for (let v of opt.extnames) {
            if (extname === v) {
                find = true;
                break;
            }
        }
        if (!find) {
            yield fs_1.removeAsync(tmpPath);
            throw new Error("invalid image type");
        }
        // 重命名
        let newPath = `${dir}/${path.basename(tmpPath)}`;
        try {
            yield fs_1.renameAsync(tmpPath, newPath);
        }
        catch (e) {
            yield fs_1.removeAsync(tmpPath);
            throw e;
        }
        return `/${path.basename(tmpPath)}`;
    });
}
function uploadMediaAsync(req, opt) {
    return __awaiter(this, void 0, void 0, function* () {
        let dir = `${opt.targetDir}/${opt.uuid}`;
        // 创建目录
        if (!(yield fs_1.accessAsync(dir)))
            yield fs_1.mkdirAsync(dir);
        // 广告目录下的照片数量是否超限
        let files = yield fs_1.listFilesAsync(`${dir}/${opt.glob}`);
        if (files.length >= opt.maxFiles)
            throw new Error("too many files");
        // 上传单张照片
        let fileInfo = yield uploadOneFile(req, opt.fieldName, { uploadDir: opt.tmpDir, maxFields: 1, maxFilesSize: opt.maxSize });
        // 后缀
        let tmpPath = fileInfo.path;
        let extname = path.extname(tmpPath);
        let find = false;
        for (let v of opt.extnames) {
            if (extname === v) {
                find = true;
                break;
            }
        }
        if (!find) {
            yield fs_1.removeAsync(tmpPath);
            throw new Error("invalid image type");
        }
        // 重命名
        let newPath = `${dir}/${path.basename(tmpPath)}`;
        try {
            yield fs_1.renameAsync(tmpPath, newPath);
        }
        catch (e) {
            yield fs_1.removeAsync(tmpPath);
            throw e;
        }
        return `${opt.uuid}/${path.basename(tmpPath)}`;
    });
}
// 上传多张照片
function uploadCollectionAsync(req, opt) {
    return __awaiter(this, void 0, void 0, function* () {
        let dir = `${opt.targetDir}/${opt.uuid}`;
        // 创建目录
        if (!(yield fs_1.accessAsync(dir)))
            yield fs_1.mkdirAsync(dir);
        // 广告目录下的照片数量是否超限
        let files = yield fs_1.listFilesAsync(`${dir}/${opt.glob}`);
        if (files.length >= opt.maxFiles)
            throw new Error("too many files");
        // 上传单张照片
        let fileInfo = yield uploadOneFile(req, opt.fieldName, { uploadDir: opt.tmpDir, maxFields: 15, maxFilesSize: opt.maxSize });
        // 后缀
        let tmpPath = fileInfo.path;
        let extname = path.extname(tmpPath);
        let find = false;
        for (let v of opt.extnames) {
            if (extname === v) {
                find = true;
                break;
            }
        }
        if (!find) {
            yield fs_1.removeAsync(tmpPath);
            throw new Error("invalid image type");
        }
        // 重命名
        let newPath = `${dir}/${path.basename(tmpPath)}`;
        try {
            yield fs_1.renameAsync(tmpPath, newPath);
        }
        catch (e) {
            yield fs_1.removeAsync(tmpPath);
            throw e;
        }
        return `${opt.uuid}/${path.basename(tmpPath)}`;
    });
}
function uploadAdsMovie(req, opt) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield uploadMediaAsync(req, opt);
    });
}
exports.uploadAdsMovie = uploadAdsMovie;
function uploadAdsImage(req, opt) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield uploadMediaAsync(req, opt);
    });
}
exports.uploadAdsImage = uploadAdsImage;
function uploadinfoImage(req, opt) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield uploadinfoMediaAsync(req, opt);
    });
}
exports.uploadinfoImage = uploadinfoImage;
function uploadCollectionImage(req, opt) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield uploadCollectionAsync(req, opt);
    });
}
exports.uploadCollectionImage = uploadCollectionImage;
function uploadHeadImg(req, opt) {
    return __awaiter(this, void 0, void 0, function* () {
        // 上传单张照片
        let fileInfo = yield uploadOneFile(req, opt.fieldName, { uploadDir: opt.tmpDir, maxFields: 1, maxFilesSize: opt.maxSize });
        // 重命名
        let tmpPath = fileInfo.path;
        let extname = path.extname(tmpPath);
        let find = false;
        for (let v of opt.extnames) {
            if (extname === v) {
                find = true;
                break;
            }
        }
        if (!find) {
            yield fs_1.removeAsync(tmpPath);
            throw new Error("invalid image type");
        }
        let newPath = `${opt.targetDir}/${opt.uuid}${path.extname(tmpPath)}`;
        try {
            yield fs_1.renameAsync(tmpPath, newPath);
        }
        catch (e) {
            yield fs_1.removeAsync(tmpPath);
            throw e;
        }
        return `${opt.uuid}${path.extname(tmpPath)}`;
    });
}
exports.uploadHeadImg = uploadHeadImg;
//# sourceMappingURL=upload.js.map