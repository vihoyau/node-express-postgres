"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.headImgOpt = {
    fieldName: "headimg",
    maxSize: 2000 * 1024,
    tmpDir: '/var/lib/openresty/tmp',
    targetDir: "/var/lib/openresty/resource/headimg",
    maxFiles: 1,
    extnames: [".jpg", ".png", ".JPG", ".PNG", ".jpeg"],
    glob: "*.{jpg,png,JPG,PNG,jpeg}"
};
exports.adsImgOpt = {
    fieldName: "adsimg",
    maxSize: 2000 * 1024,
    targetDir: "/var/lib/openresty/resource/ads",
    tmpDir: '/var/lib/openresty/tmp',
    maxFiles: 20,
    extnames: [".jpg", ".png", ".gif", ".jpeg"],
    glob: "*.{jpg,png,gif,jpeg}"
};
exports.infoCateImgOpt = {
    fieldName: "infocateimg",
    maxSize: 2000 * 1024,
    //targetDir: "D:\\pic\\infocate",
    tmpDir: '/var/lib/openresty/tmp',
    targetDir: "/var/lib/openresty/resource/infocate",
    maxFiles: 20,
    extnames: [".jpg", ".png", ".gif", ".jpeg"],
    glob: "*.{jpg,png,gif,jpeg}"
};
exports.trendImgOpt = {
    fieldName: "trendimg",
    maxSize: 10000 * 1024,
    targetDir: "/var/lib/openresty/resource/trendimg",
    tmpDir: "/var/lib/openresty/tmp",
    //tmpDir: '/var/lib/openresty/tmp',
    //targetDir: "/var/lib/openresty/resource/trendimg",
    maxFiles: 20,
    extnames: [".jpg", ".png", ".gif", ".jpeg", ".jpeg"],
    glob: "*.{jpg,png,gif,jpeg}"
};
exports.infoImgOpt = {
    fieldName: "infoimg",
    maxSize: 2000 * 1024,
    //targetDir: "D:\\pic\\info",
    tmpDir: '/var/lib/openresty/tmp',
    // targetDir: "/var/lib/openresty/resource/info",
    targetDir: "/var/lib/openresty/resource/info",
    maxFiles: 20,
    extnames: [".jpg", ".png", ".gif", ".jpeg"],
    glob: "*.{jpg,png,gif,jpeg}"
};
exports.collectionCoverImgOpt = {
    fieldName: "adsimg",
    maxSize: 2000 * 1024,
    targetDir: "/var/lib/openresty/resource/collection",
    tmpDir: '/var/lib/openresty/collection',
    //targetDir: "/var/lib/openresty/resource/ads",
    maxFiles: 25,
    extnames: [".jpg", ".png", ".gif", ".jpeg"],
    glob: "*.{jpg,png,gif,jpeg}"
};
exports.adsCoverImgOpt = {
    fieldName: "adsimg",
    maxSize: 2000 * 1024,
    targetDir: "/var/lib/openresty/resource/adscover",
    tmpDir: '/var/lib/openresty/tmp',
    //targetDir: "/var/lib/openresty/resource/ads",
    maxFiles: 20,
    extnames: [".jpg", ".png", ".gif", ".jpeg"],
    glob: "*.{jpg,png,gif,jpeg}"
};
exports.infoCoverImgOpt = {
    fieldName: "infocoverimg",
    maxSize: 2000 * 1024,
    //targetDir: "D:\\pic\\infocover",
    tmpDir: '/var/lib/openresty/tmp',
    // targetDir: "/var/lib/openresty/resource/infocover",
    targetDir: '/var/lib/openresty/resource/infocover',
    maxFiles: 20,
    extnames: [".jpg", ".png", ".gif", ".jpeg"],
    glob: "*.{jpg,png,gif,jpeg}"
};
exports.goodsImgOpt = {
    fieldName: "adsimg",
    maxSize: 2000 * 1024,
    tmpDir: '/var/lib/openresty/tmp',
    targetDir: "/var/lib/openresty/resource/goods",
    //targetDir: "/var/lib/openresty/resource/goods",
    maxFiles: 5,
    extnames: [".jpg", ".png", ".jpeg"],
    glob: "*.{jpg,png,jpeg}"
};
exports.couponImgOpt = {
    fieldName: "adsimg",
    maxSize: 2000 * 1024,
    tmpDir: '/var/lib/openresty/tmp',
    targetDir: "/var/lib/openresty/resource/coupon",
    //targetDir: "/var/lib/openresty/resource/goods",
    maxFiles: 5,
    extnames: [".jpg", ".png", ".jpeg"],
    glob: "*.{jpg,png,jpeg}"
};
exports.categoryImgOpt = {
    fieldName: "adsimg",
    maxSize: 2000 * 1024,
    tmpDir: '/var/lib/openresty/tmp',
    targetDir: "/var/lib/openresty/resource/category",
    //targetDir: "/var/lib/openresty/resource/goods",
    maxFiles: 20,
    extnames: [".jpg", ".png", ".jpeg"],
    glob: "*.{jpg,png,jpeg}"
};
exports.subcategoryImgOpt = {
    fieldName: "adsimg",
    maxSize: 2000 * 1024,
    tmpDir: '/var/lib/openresty/tmp',
    targetDir: "/var/lib/openresty/resource/subcategory",
    //targetDir: "/var/lib/openresty/resource/goods",
    maxFiles: 20,
    extnames: [".jpg", ".png", ".jpeg"],
    glob: "*.{jpg,png,jpeg}"
};
exports.goodsTagsImgOpt = {
    fieldName: "adsimg",
    maxSize: 2000 * 1024,
    tmpDir: '/var/lib/openresty/tmp',
    targetDir: "/var/lib/openresty/resource/goodsTags",
    maxFiles: 20,
    //targetDir: "/var/lib/openresty/resource/goods",
    extnames: [".jpg", ".png", ".jpeg"],
    glob: "*.{jpg,png,jpeg}"
};
exports.goodsDetailImgOpt = {
    fieldName: "goodsdetail",
    maxSize: 2000 * 1024,
    tmpDir: "/var/lib/openresty/tmp",
    targetDir: "/var/lib/openresty/resource/goodsdetail",
    maxFiles: 20,
    //targetDir: "/var/lib/openresty/resource/goods",
    extnames: [".jpg", ".png", ".jpeg"],
    glob: "*.{jpg,png,jpeg}"
};
exports.adscategoryImgOpt = {
    fieldName: "adsimg",
    maxSize: 2000 * 1024,
    tmpDir: '/var/lib/openresty/tmp',
    targetDir: "/var/lib/openresty/resource/adscategory",
    //targetDir: "/var/lib/openresty/resource/goods",
    maxFiles: 1,
    extnames: [".jpg", ".png", ".jpeg"],
    glob: "*.{jpg,png,jpeg}"
};
exports.goodsBannerImgOpt = {
    fieldName: "adsimg",
    maxSize: 2000 * 1024,
    tmpDir: '/var/lib/openresty/tmp',
    targetDir: "/var/lib/openresty/resource/goodsbanner",
    //targetDir: "/var/lib/openresty/resource/goods",
    maxFiles: 1,
    extnames: [".jpg", ".png", ".jpeg"],
    glob: "*.{jpg,png,jpeg}"
};
exports.goodscategoryImgOpt = {
    fieldName: "adsimg",
    maxSize: 2000 * 1024,
    tmpDir: '/var/lib/openresty/tmp',
    targetDir: "/var/lib/openresty/resource/goodscategory",
    //targetDir: "/var/lib/openresty/resource/goods",
    maxFiles: 1,
    extnames: [".jpg", ".png", ".jpeg"],
    glob: "*.{jpg,png,jpeg}"
};
exports.adsMovOpt = {
    fieldName: "adsmov",
    maxSize: 25 * 1024 * 1024,
    tmpDir: '/var/lib/openresty/tmp',
    //targetDir: "/var/lib/openresty/resource/ads",
    targetDir: "/var/lib/openresty/resource/ads",
    maxFiles: 1,
    extnames: [".mp4"],
    glob: "*.mp4"
};
exports.trendMovOpt = {
    fieldName: "trendmov",
    maxSize: 25 * 1024 * 1024,
    tmpDir: '/var/lib/openresty/tmp',
    // tmpDir: '/var/lib/openresty/tmp',
    //targetDir: "/var/lib/openresty/resource/trendmov",
    targetDir: "/var/lib/openresty/resource/trendmov",
    maxFiles: 1,
    extnames: [".mp4", ".MP4", ".MOV", ".mov"],
    glob: "*.{mp4,MP4,MOV,mov}"
};
exports.infoMovOpt = {
    fieldName: "infomov",
    maxSize: 25 * 1024 * 1024,
    tmpDir: '/var/lib/openresty/tmp',
    targetDir: "/var/lib/openresty/resource/infomov",
    //targetDir: "D:\\pic\\infomov",
    maxFiles: 1,
    extnames: [".mp4"],
    glob: "*.mp4"
};
exports.makePoint = {
    ratio: 1
};
//# sourceMappingURL=resource.js.map