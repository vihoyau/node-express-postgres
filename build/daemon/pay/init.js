"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wxautopay = require("./wxpay");
function init(eventMap) {
    wxautopay.init(eventMap);
    wxautopay.run(); //TODO
}
exports.init = init;
//# sourceMappingURL=init.js.map