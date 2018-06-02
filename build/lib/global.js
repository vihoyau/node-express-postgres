"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let app;
function setApplication(appp) {
    app = appp;
}
exports.setApplication = setApplication;
function getModel(name) {
    let seqz = app.locals.sequelize;
    return seqz.model(name);
}
exports.getModel = getModel;
//# sourceMappingURL=global.js.map