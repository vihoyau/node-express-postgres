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
const express_1 = require("express");
const response_1 = require("../../lib/response");
const logistics_1 = require("../../lib/logistics");
const logistics_2 = require("../../model/logistics/logistics");
// import { findByPrimary } from "../../model/orders/orders"
// import { findByPrimary as findusers } from "../../model/users/users"
// import { createMessage } from "../../model/users/message"
const logger = require("winston");
exports.router = express_1.Router();
exports.router.all('/', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = req.body;
        let logistics = JSON.parse(result.RequestData).Data;
        try {
            for (let i = 0; i < logistics.length; i++) {
                let logistic = yield logistics_2.getByCode(logistics[i].ShipperCode, logistics[i].LogisticCode);
                if (logistic) {
                    // let order = await findByPrimary(logistic.ordercode)
                    // if (order) {
                    //     let user = await findusers(order.useruuid)
                    //     let content
                    //     switch (order.state) {
                    //         case "wait-pay":
                    //             content = "您有一个待支付订单！"
                    //             break;
                    //         case "wait-send":
                    //             content = "您有一个待发货订单！"
                    //             break;
                    //         case "wait-recv":
                    //             content = "您的商品已发货！"
                    //             break;
                    //         case "wait-comment":
                    //             content = "您有一个待评价订单！"
                    //             break;
                    //         case "wait-ack":
                    //             content = "您有一个待审核订单！"
                    //             break;
                    //         case "cancel":
                    //             content = "您的订单已取消！"
                    //             break;
                    //         case "finish":
                    //             content = "您的订单已完成！"
                    //             break;
                    //     }
                    //     let obj = {
                    //         useruuid: user.uuid,
                    //         username: user.username,
                    //         content: content,
                    //         state: 'send',
                    //         orderuuid: order.uuid,
                    //         title: '物流消息'
                    //     }
                    //     await createMessage(obj)
                    // }
                    yield logistics_2.updateTraces(logistics[i].ShipperCode, logistics[i].LogisticCode, logistics[i].Traces);
                }
                else {
                    let lo = {
                        logisticscode: logistics[i].LogisticCode,
                        shippercode: logistics[i].ShipperCode,
                        traces: logistics[i].Traces
                    };
                    yield logistics_2.insertLogistics(lo);
                }
            }
            return response_1.sendOK(res, logistics_1.logisticsReturn());
        }
        catch (e) {
            logger.info("logistics notify error", e.message);
        }
    });
});
//# sourceMappingURL=logistics.js.map