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
const validator_1 = require("../../lib/validator");
const validator_2 = require("./validator");
const express_1 = require("express");
const response_1 = require("../../lib/response");
const logindao_1 = require("../../redis/logindao");
const plan_1 = require("../../model/puton/plan");
const unit_1 = require("../../model/puton/unit");
const controltime_1 = require("../../model/puton/controltime");
const ads_1 = require("../../model/ads/ads");
const crmuser_1 = require("../../model/ads/crmuser");
// import { queryCrmuser } from "../../model/ads/crmuser"
// import { queryadvByuuid } from "../../model/ads/crmuser"
const winston_1 = require("../../config/winston");
const advertiser_1 = require("../../model/ads/advertiser");
const adsoperation_1 = require("../../model/ads/adsoperation");
const system_1 = require("../../model/system/system");
//import { findByPrimary } from "../../model/ads/advertiser"
//新添加
//import { finduuid } from "../../model/users/users_ext"
const ads_ext_1 = require("../../model/ads/ads_ext");
exports.router = express_1.Router();
/**
 * 计划 回显所有的值
 *
 */
exports.router.get('/getAllplan', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        let start = req.query.start;
        let length = req.query.length;
        let draw = req.query.draw;
        //广告商的uuid
        let advertiseruuid = req.query.advertiseruuid;
        let recordsFiltered;
        let search = req.query.search;
        let searchdata = search.value;
        try {
            if (loginInfo.isRoot()) {
                if (advertiseruuid == undefined) {
                    let re = yield plan_1.queryplanAllBypage(searchdata, parseInt(start), parseInt(length));
                    if (re.length == 0) {
                        return response_1.sendOK(res, { re, draw: draw, recordsFiltered: 0 });
                    }
                    let unitarr = yield unit_1.queryunitAll(searchdata, req.app.locals.sequelize, re);
                    let ads = yield ads_1.queryPutonadsByunituuids(req.app.locals.sequelize, unitarr);
                    for (let i = 0; i < unitarr.length; i++) {
                        let showamount = 0;
                        let pointmount = 0;
                        for (let j = 0; j < ads.length; j++) {
                            if (ads[j].unituuid == unitarr[i].uuid) {
                                ads[j].showamount = ads[j].showamount ? ads[j].showamount : 0;
                                ads[j].pointmount = ads[j].pointmount ? ads[j].pointmount : 0;
                                showamount = showamount + parseInt(ads[j].showamount);
                                pointmount = pointmount + parseInt(ads[j].pointmount);
                            }
                        }
                        unitarr[i].showamount = showamount;
                        unitarr[i].pointmount = pointmount;
                        unitarr[i].bid = unitarr[i].bid ? unitarr[i].bid : 0;
                        if (unitarr[i].method == 'cpc') {
                            unitarr[i].consume = pointmount * parseFloat(unitarr[i].bid);
                        }
                        else if (unitarr[i].method == 'cpm') {
                            unitarr[i].consume = parseInt((showamount / 1000).toString()) * parseFloat(unitarr[i].bid);
                        }
                        else if (unitarr[i].method == 'cpe') {
                            if (unitarr[i].cpe_type == 0) {
                                unitarr[i].consume = parseInt((showamount / 1000).toString()) * parseFloat(unitarr[i].bid);
                            }
                            else if (unitarr[i].cpe_type == 1) {
                                unitarr[i].consume = pointmount * parseFloat(unitarr[i].bid);
                            }
                            else {
                                unitarr[i].consume = 0.00;
                            }
                        }
                        else {
                            unitarr[i].consume = 0.00;
                        }
                        unitarr[i].CTR = showamount == 0 ? 0.00 : pointmount / showamount;
                        //unitarr[i].Price_of_thousand = showamount==0?0.000: ((pointmount / showamount) * parseFloat(unitarr[i].bid) * 1000).toFixed(2);
                        unitarr[i].Price_of_thousand = parseInt((showamount / 100).toString()) * parseFloat(unitarr[i].bid);
                    }
                    for (let j = 0; j < re.length; j++) {
                        re[j].startdate = winston_1.timestamps(re[j].startdate);
                        if (re[j].enddate != undefined) {
                            re[j].enddate = winston_1.timestamps(re[j].enddate);
                        }
                        re[j].pointmount = 0;
                        re[j].showamount = 0;
                        re[j].consume = 0.00;
                        re[j].bid = 0;
                        re[j].Price_of_thousand = 0;
                        re[j].CTR = 0;
                        for (let i = 0; i < unitarr.length; i++) {
                            if (re[j].uuid && unitarr[i].planuuid && re[j].uuid == unitarr[i].planuuid) {
                                re[j].pointmount = parseInt(re[j].pointmount) + parseInt(unitarr[i].pointmount);
                                re[j].showamount = parseInt(re[j].showamount) + parseInt(unitarr[i].showamount);
                                re[j].consume = parseFloat(re[j].consume) + parseFloat(unitarr[i].consume);
                                re[j].bid = re[j].pointmount == 0 ? 0.00 : parseFloat(re[j].consume) / parseInt(re[j].pointmount);
                                //re[j].Price_of_thousand = re[j].showamount==0?0.000:parseFloat(re[j].bid)==0?0: (parseInt(re[j].pointmount) / parseInt(re[j].showamount) / parseFloat(re[j].bid) * 1000).toFixed(2);
                                re[j].Price_of_thousand = parseFloat(re[j].Price_of_thousand) + parseFloat(unitarr[i].Price_of_thousand);
                                re[j].CTR = parseInt(re[j].showamount) == 0 ? 0.00 : parseInt(re[j].pointmount) / parseInt(re[j].showamount);
                            }
                        }
                        re[j].consume = (re[j].consume).toFixed(2);
                        re[j].bid = (re[j].bid).toFixed(2);
                        re[j].Price_of_thousand = re[j].showamount >= 1000 ? (re[j].consume / parseInt((re[j].showamount / 1000).toString())).toFixed(2) : "0.00";
                        re[j].CTR = (re[j].CTR).toFixed(2);
                    }
                    recordsFiltered = yield plan_1.queryplanAllcount(req.app.locals.sequelize);
                    return response_1.sendOK(res, { re, draw: draw, recordsFiltered: recordsFiltered[0].count });
                }
                else {
                    let re = yield plan_1.queryplanAllBypage(searchdata, parseInt(start), parseInt(length), advertiseruuid);
                    if (re.length == 0) {
                        return response_1.sendOK(res, { re, draw: draw, recordsFiltered: 0 });
                    }
                    let unitarr = yield unit_1.queryunitAll(searchdata, req.app.locals.sequelize, re);
                    let ads = yield ads_1.queryPutonadsByunituuids(req.app.locals.sequelize, unitarr);
                    for (let i = 0; i < unitarr.length; i++) {
                        let showamount = 0;
                        let pointmount = 0;
                        let allbalance = 0;
                        for (let j = 0; j < ads.length; j++) {
                            if (ads[j].unituuid == unitarr[i].uuid) {
                                ads[j].showamount = ads[j].showamount ? ads[j].showamount : 0;
                                ads[j].pointmount = ads[j].pointmount ? ads[j].pointmount : 0;
                                showamount = showamount + parseInt(ads[j].showamount);
                                pointmount = pointmount + parseInt(ads[j].pointmount);
                                allbalance = ads[j].allbalance ? ads[j].allbalance : 0;
                            }
                        }
                        unitarr[i].showamount = showamount;
                        unitarr[i].pointmount = pointmount;
                        unitarr[i].bid = unitarr[i].bid ? unitarr[i].bid : 0;
                        if (unitarr[i].method == 'cpc') {
                            unitarr[i].consume = pointmount * parseFloat(unitarr[i].bid);
                        }
                        else if (unitarr[i].method == 'cpm') {
                            unitarr[i].consume = parseInt((showamount / 1000).toString()) * parseFloat(unitarr[i].bid);
                        }
                        else if (unitarr[i].method == 'cpe') {
                            if (unitarr[i].cpe_type == 0) { //展示
                                unitarr[i].consume = parseInt((showamount / 1000).toString()) * parseFloat(unitarr[i].bid);
                            }
                            else if (unitarr[i].cpe_type == 1) { //点击
                                unitarr[i].consume = pointmount * parseFloat(unitarr[i].bid);
                            }
                            else { //租用？？还消费个毛线啊
                                unitarr[i].consume = 0.00;
                            }
                        }
                        else {
                            unitarr[i].consume = 0.00;
                        }
                        unitarr[i].consume += allbalance;
                        unitarr[i].CTR = showamount == 0 ? 0.000 : (pointmount / showamount).toFixed(2);
                        unitarr[i].Price_of_thousand = (parseInt((showamount / 1000).toString()) * parseFloat(unitarr[i].bid)).toFixed(2);
                    }
                    for (let j = 0; j < re.length; j++) {
                        re[j].startdate = winston_1.timestamps(re[j].startdate);
                        if (re[j].enddate != undefined) {
                            re[j].enddate = winston_1.timestamps(re[j].enddate);
                        }
                        re[j].pointmount = 0;
                        re[j].showamount = 0;
                        re[j].consume = 0.00;
                        re[j].bid = 0;
                        re[j].Price_of_thousand = 0;
                        re[j].CTR = 0;
                        for (let i = 0; i < unitarr.length; i++) {
                            if (re[j].uuid && unitarr[i].planuuid && re[j].uuid == unitarr[i].planuuid) {
                                re[j].pointmount = parseInt(re[j].pointmount) + parseInt(unitarr[i].pointmount);
                                re[j].showamount = parseInt(re[j].showamount) + parseInt(unitarr[i].showamount);
                                re[j].consume = parseFloat(re[j].consume) + parseFloat(unitarr[i].consume);
                                re[j].bid = parseInt(re[j].pointmount) == 0 ? 0.00 : parseFloat(re[j].consume) / parseInt(re[j].pointmount);
                                re[j].Price_of_thousand = parseFloat(re[j].Price_of_thousand) + parseFloat(unitarr[i].Price_of_thousand);
                                re[j].CTR = parseInt(re[j].showamount) == 0 ? 0.00 : parseInt(re[j].pointmount) / parseInt(re[j].showamount);
                            }
                        }
                        re[j].consume = (re[j].consume).toFixed(2);
                        re[j].bid = (re[j].bid).toFixed(2);
                        re[j].Price_of_thousand = re[j].showamount >= 1000 ? (re[j].consume / parseInt((re[j].showamount / 1000).toString())).toFixed(2) : "0.00";
                        re[j].CTR = (re[j].CTR).toFixed(2);
                    }
                    let tempnum = yield plan_1.queryplanAllcount(req.app.locals.sequelize, advertiseruuid);
                    return response_1.sendOK(res, { re, draw: draw, recordsFiltered: parseInt(tempnum[0].count) });
                }
            }
            else {
                let re = yield plan_1.queryplanAllBypage(searchdata, parseInt(start), parseInt(length), advertiseruuid);
                if (re.length == 0) {
                    return response_1.sendOK(res, { re, draw: draw, recordsFiltered: 0 });
                }
                let unitarr = yield unit_1.queryunitAll(searchdata, req.app.locals.sequelize, re);
                let ads = yield ads_1.queryPutonadsByunituuids(req.app.locals.sequelize, unitarr);
                for (let i = 0; i < unitarr.length; i++) {
                    let showamount = 0;
                    let pointmount = 0;
                    let allbalance = 0;
                    for (let j = 0; j < ads.length; j++) {
                        if (ads[j].unituuid == unitarr[i].uuid) {
                            ads[j].showamount = ads[j].showamount ? ads[j].showamount : 0;
                            ads[j].pointmount = ads[j].pointmount ? ads[j].pointmount : 0;
                            showamount = showamount + parseInt(ads[j].showamount);
                            pointmount = pointmount + parseInt(ads[j].pointmount);
                            allbalance = ads[j].allbalance ? ads[j].allbalance : 0;
                        }
                    }
                    unitarr[i].showamount = showamount;
                    unitarr[i].pointmount = pointmount;
                    unitarr[i].bid = unitarr[i].bid ? unitarr[i].bid : 0;
                    if (unitarr[i].method == 'cpc') {
                        unitarr[i].consume = pointmount * parseFloat(unitarr[i].bid);
                    }
                    else if (unitarr[i].method == 'cpm') {
                        unitarr[i].consume = parseInt((showamount / 1000).toString()) * parseFloat(unitarr[i].bid);
                    }
                    else if (unitarr[i].method == 'cpe') {
                        if (unitarr[i].cpe_type == 0) {
                            unitarr[i].consume = parseInt((showamount / 1000).toString()) * parseFloat(unitarr[i].bid);
                        }
                        else if (unitarr[i].cpe_type == 1) {
                            unitarr[i].consume = pointmount * parseFloat(unitarr[i].bid);
                        }
                        else {
                            unitarr[i].consume = 0.00;
                        }
                    }
                    else {
                        unitarr[i].consume = 0.00;
                    }
                    unitarr[i].consume += allbalance;
                    unitarr[i].CTR = showamount == 0 ? 0.00 : pointmount / showamount;
                    unitarr[i].Price_of_thousand = unitarr[i].consume / parseInt((showamount / 1000).toString());
                }
                for (let j = 0; j < re.length; j++) {
                    re[j].startdate = winston_1.timestamps(re[j].startdate);
                    if (re[j].enddate != undefined) {
                        re[j].enddate = winston_1.timestamps(re[j].enddate);
                    }
                    re[j].pointmount = 0;
                    re[j].showamount = 0;
                    re[j].consume = 0.00;
                    re[j].bid = 0;
                    re[j].Price_of_thousand = 0;
                    re[j].CTR = 0;
                    for (let i = 0; i < unitarr.length; i++) {
                        if (re[j].uuid == unitarr[i].planuuid) {
                            re[j].pointmount = parseInt(re[j].pointmount) + parseInt(unitarr[i].pointmount);
                            re[j].showamount = parseInt(re[j].showamount) + parseInt(unitarr[i].showamount);
                            re[j].consume = parseFloat(re[j].consume) + parseFloat(unitarr[i].consume);
                            re[j].bid = parseInt(re[j].pointmount) == 0 ? 0.00 : parseInt(re[j].consume) / parseInt(re[j].pointmount);
                            re[j].Price_of_thousand = parseFloat(re[j].Price_of_thousand) + parseFloat(unitarr[i].Price_of_thousand);
                            re[j].CTR = parseInt(re[j].showamount) == 0 ? 0.00 : parseInt(re[j].pointmount) / parseInt(re[j].showamount);
                        }
                    }
                    re[j].consume = (re[j].consume).toFixed(2);
                    re[j].bid = (re[j].bid).toFixed(2);
                    re[j].Price_of_thousand = re[j].showamount >= 1000 ? (re[j].consume / parseInt((re[j].showamount / 1000).toString())).toFixed(2) : "0.00";
                    re[j].CTR = (re[j].CTR).toFixed(2);
                }
                let tempnum = yield plan_1.queryplanAllcount(req.app.locals.sequelize, advertiseruuid);
                return response_1.sendOK(res, { re, draw: draw, recordsFiltered: parseInt(tempnum[0].count) });
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/getAllunit', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        let start = req.query.start;
        let length = req.query.length;
        let draw = req.query.draw;
        let recordsFiltered;
        let advertiseruuid = req.query.advertiseruuid;
        let search = req.query.search;
        let searchdata = search.value;
        try {
            let unitlength = 0;
            let pushlength = 0;
            if (loginInfo.isRoot()) {
                if (advertiseruuid == undefined) {
                    recordsFiltered = 0;
                    let unitarr = [];
                    let re = yield plan_1.queryplanAll();
                    //re[j].get('uuid')
                    //for (let j = 0; j < re.length; j++) {
                    let units;
                    if (unitlength <= parseInt(length)) {
                        units = yield unit_1.queryunitAll(searchdata, req.app.locals.sequelize, re);
                    }
                    if (units) {
                        for (let x = 0; x < units.length; x++) {
                            if (pushlength >= parseInt(start) && unitlength <= parseInt(length)) {
                                unitarr.push(units[x]);
                                unitlength++;
                            }
                            pushlength++;
                        }
                    }
                    let ads = yield ads_1.queryPutonadsByunituuids(req.app.locals.sequelize, unitarr);
                    for (let i = 0; i < unitarr.length; i++) {
                        let showamount = 0;
                        let pointmount = 0;
                        for (let j = 0; j < ads.length; j++) {
                            if (ads[j].unituuid == unitarr[i].uuid) {
                                showamount = showamount + parseInt(ads[j].showamount);
                                pointmount = pointmount + parseInt(ads[j].pointmount);
                            }
                        }
                        unitarr[i].showamount = showamount;
                        unitarr[i].pointmount = pointmount;
                        if (unitarr[i].method == 'cpc') {
                            unitarr[i].consume = (pointmount * parseFloat(unitarr[i].bid)).toFixed(2);
                        }
                        else if (unitarr[i].method == 'cpm') {
                            unitarr[i].consume = (parseInt((showamount / 1000).toString()) * parseFloat(unitarr[i].bid)).toFixed(2);
                        }
                        else if (unitarr[i].method == 'cpe') {
                            if (unitarr[i].cpe_type == 0) {
                                unitarr[i].consume = (parseInt((showamount / 1000).toString()) * parseFloat(unitarr[i].bid)).toFixed(2);
                            }
                            else if (unitarr[i].cpe_type == 1) {
                                unitarr[i].consume = (pointmount * parseFloat(unitarr[i].bid)).toFixed(2);
                            }
                            else {
                                unitarr[i].consume = (parseInt((showamount / 1000).toString()) * parseFloat(unitarr[i].bid)).toFixed(2);
                                unitarr[i].consume = (unitarr[i].consume + pointmount * parseFloat(unitarr[i].bid)).toFixed(2);
                            }
                        }
                        //unitarr[i].consume = (pointmount * parseFloat(unitarr[i].bid)).toFixed(2)
                        unitarr[i].CTR = showamount == 0 ? 0.000 : (pointmount / showamount).toFixed(2);
                        //unitarr[i].Price_of_thousand =showamount==0?0: ((pointmount / showamount) * parseFloat(unitarr[i].bid) * 1000).toFixed(2);
                        unitarr[i].Price_of_thousand = (parseInt((showamount / 1000).toString()) * parseFloat(unitarr[i].bid)).toFixed(2);
                        for (let j = 0; j < re.length; j++) {
                            if (re[j].uuid == unitarr[i].planuuid) {
                                unitarr[i].planname = re[j].name;
                                unitarr[i].putresource = re[j].putresource;
                                unitarr[i].dailybudget = re[j].dailybudget;
                            }
                        }
                    }
                    for (let j = 0; j < re.length; j++) {
                        let tempnum = yield unit_1.queryunitAllcount(req.app.locals.sequelize, re[j].uuid);
                        recordsFiltered = recordsFiltered + parseInt(tempnum[0].count);
                    }
                    return response_1.sendOK(res, { 're': unitarr, draw: draw, recordsFiltered: recordsFiltered });
                }
                else {
                    let unitarr = [];
                    recordsFiltered = 0;
                    let tempnum;
                    let re = yield plan_1.queryplanAll(advertiseruuid);
                    //for (let j = 0; j < re.length; j++) {
                    let units = null;
                    if (unitlength <= parseInt(length)) {
                        units = yield unit_1.queryunitAll(searchdata, req.app.locals.sequelize, re);
                    }
                    if (units) {
                        for (let x = 0; x < units.length; x++) {
                            if (pushlength >= parseInt(start) && unitlength <= parseInt(length)) {
                                unitarr.push(units[x]);
                                unitlength++;
                            }
                            pushlength++;
                        }
                    }
                    let ads = yield ads_1.queryPutonadsByunituuids(req.app.locals.sequelize, unitarr);
                    for (let i = 0; i < unitarr.length; i++) {
                        let showamount = 0;
                        let pointmount = 0;
                        for (let j = 0; j < ads.length; j++) {
                            if (ads[j].unituuid == unitarr[i].uuid) {
                                showamount = showamount + parseInt(ads[j].showamount);
                                pointmount = pointmount + parseInt(ads[j].pointmount);
                            }
                        }
                        unitarr[i].showamount = showamount;
                        unitarr[i].pointmount = pointmount;
                        if (unitarr[i].method == 'cpc') {
                            unitarr[i].consume = (pointmount * parseFloat(unitarr[i].bid)).toFixed(2);
                        }
                        else if (unitarr[i].method == 'cpm') {
                            unitarr[i].consume = (parseInt((showamount / 1000).toString()) * parseFloat(unitarr[i].bid)).toFixed(2);
                        }
                        else if (unitarr[i].method == 'cpe') {
                            if (unitarr[i].cpe_type == 0) {
                                unitarr[i].consume = (parseInt((showamount / 1000).toString()) * parseFloat(unitarr[i].bid)).toFixed(2);
                            }
                            else if (unitarr[i].cpe_type == 1) {
                                unitarr[i].consume = (pointmount * parseFloat(unitarr[i].bid)).toFixed(2);
                            }
                            else {
                                unitarr[i].consume = (parseInt((showamount / 1000).toString()) * parseFloat(unitarr[i].bid)).toFixed(2);
                                unitarr[i].consume = (unitarr[i].consume + pointmount * parseFloat(unitarr[i].bid)).toFixed(2);
                            }
                        }
                        //unitarr[i].consume = (pointmount * parseFloat(unitarr[i].bid)).toFixed(2)
                        unitarr[i].CTR = showamount == 0 ? 0.000 : (pointmount / showamount).toFixed(2);
                        //unitarr[i].Price_of_thousand =showamount==0?0:  ((pointmount / showamount) * parseFloat(unitarr[i].bid) * 1000).toFixed(2);
                        unitarr[i].Price_of_thousand = (parseInt((showamount / 1000).toString()) * parseFloat(unitarr[i].bid)).toFixed(2);
                        for (let j = 0; j < re.length; j++) {
                            if (re[j].uuid == unitarr[i].planuuid) {
                                unitarr[i].planname = re[j].name;
                                unitarr[i].putresource = re[j].putresource;
                                unitarr[i].dailybudget = re[j].dailybudget;
                            }
                        }
                    }
                    for (let j = 0; j < re.length; j++) {
                        tempnum = yield unit_1.queryunitAllcount(req.app.locals.sequelize, re[j].uuid);
                        if (tempnum != undefined) {
                            recordsFiltered = recordsFiltered + parseInt(tempnum[0].count);
                        }
                    }
                    return response_1.sendOK(res, { 're': unitarr, draw: draw, recordsFiltered: recordsFiltered });
                }
            }
            else {
                let unitarr = [];
                recordsFiltered = 0;
                let tempnum;
                let re = yield plan_1.queryplanAll(advertiseruuid);
                //for (let j = 0; j < re.length; j++) {
                let units = null;
                if (unitlength <= parseInt(length)) {
                    units = yield unit_1.queryunitAll(searchdata, req.app.locals.sequelize, re);
                }
                if (units) {
                    for (let x = 0; x < units.length; x++) {
                        if (pushlength >= parseInt(start) && unitlength <= parseInt(length)) {
                            unitarr.push(units[x]);
                            unitlength++;
                        }
                        pushlength++;
                    }
                }
                let ads = yield ads_1.queryPutonadsByunituuids(req.app.locals.sequelize, unitarr);
                for (let i = 0; i < unitarr.length; i++) {
                    let showamount = 0;
                    let pointmount = 0;
                    for (let j = 0; j < ads.length; j++) {
                        if (ads[j].unituuid == unitarr[i].uuid) {
                            showamount = showamount + parseInt(ads[j].showamount);
                            pointmount = pointmount + parseInt(ads[j].pointmount);
                        }
                    }
                    unitarr[i].showamount = showamount;
                    unitarr[i].pointmount = pointmount;
                    if (unitarr[i].method == 'cpc') {
                        unitarr[i].consume = (pointmount * parseFloat(unitarr[i].bid)).toFixed(2);
                    }
                    else if (unitarr[i].method == 'cpm') {
                        unitarr[i].consume = (parseInt((showamount / 1000).toString()) * parseFloat(unitarr[i].bid)).toFixed(2);
                    }
                    else if (unitarr[i].method == 'cpe') {
                        if (unitarr[i].cpe_type == 0) {
                            unitarr[i].consume = (parseInt((showamount / 1000).toString()) * parseFloat(unitarr[i].bid)).toFixed(2);
                        }
                        else if (unitarr[i].cpe_type == 1) {
                            unitarr[i].consume = (pointmount * parseFloat(unitarr[i].bid)).toFixed(2);
                        }
                        else {
                            unitarr[i].consume = (parseInt((showamount / 1000).toString()) * parseFloat(unitarr[i].bid)).toFixed(2);
                            unitarr[i].consume = (unitarr[i].consume + pointmount * parseFloat(unitarr[i].bid)).toFixed(2);
                        }
                    }
                    // unitarr[i].consume = (pointmount * parseFloat(unitarr[i].bid)).toFixed(2)
                    unitarr[i].CTR = showamount == 0 ? 0.000 : (pointmount / showamount).toFixed(2);
                    //unitarr[i].Price_of_thousand =showamount==0?0:  ((pointmount / showamount) * parseFloat(unitarr[i].bid) * 1000).toFixed(2);
                    unitarr[i].Price_of_thousand = (parseInt((showamount / 1000).toString()) * parseFloat(unitarr[i].bid)).toFixed(2);
                    for (let j = 0; j < re.length; j++) {
                        if (re[j].uuid == unitarr[i].planuuid) {
                            unitarr[i].planname = re[j].name;
                            unitarr[i].putresource = re[j].putresource;
                            unitarr[i].dailybudget = re[j].dailybudget;
                        }
                    }
                }
                for (let j = 0; j < re.length; j++) {
                    tempnum = yield unit_1.queryunitAllcount(req.app.locals.sequelize, re[j].uuid);
                    if (tempnum != undefined) {
                        recordsFiltered = recordsFiltered + parseInt(tempnum[0].count);
                    }
                }
                return response_1.sendOK(res, { 're': unitarr, draw: draw, recordsFiltered: recordsFiltered });
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/:planuuid/getunitAll', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let planuuid = req.params['planuuid'];
        let start = req.query.start;
        let length = req.query.length;
        let draw = req.query.draw;
        let recordsFiltered;
        try {
            let plan = yield plan_1.queryplanone(planuuid);
            let re = yield unit_1.queryunitAllBypage(parseInt(start), parseInt(length), planuuid);
            let ads = yield ads_1.queryPutonadsByunituuids(req.app.locals.sequelize, re);
            for (let i = 0; i < re.length; i++) {
                let showamount = 0;
                let pointmount = 0;
                let allbalance = 0;
                for (let j = 0; j < ads.length; j++) {
                    if (ads[j].unituuid == re[i].uuid) {
                        showamount = showamount + parseInt(ads[j].showamount);
                        pointmount = pointmount + parseInt(ads[j].pointmount);
                        allbalance = ads[j].allbalance ? ads[j].allbalance : 0;
                    }
                }
                re[i].showamount = showamount;
                re[i].pointmount = pointmount;
                if (re[i].method == 'cpc') {
                    re[i].consume = (pointmount * parseFloat(re[i].bid)).toFixed(2);
                }
                else if (re[i].method == 'cpm') {
                    re[i].consume = (parseInt((showamount / 1000).toString()) * parseFloat(re[i].bid)).toFixed(2);
                }
                else if (re[i].method == 'cpe') {
                    if (re[i].cpe_type == 0) {
                        re[i].consume = (parseInt((showamount / 1000).toString()) * parseFloat(re[i].bid)).toFixed(2);
                    }
                    else if (re[i].cpe_type == 1) {
                        re[i].consume = (pointmount * parseFloat(re[i].bid)).toFixed(2);
                    }
                    else {
                        re[i].consume = 0.00;
                    }
                }
                else {
                    re[i].consume = 0.00;
                }
                re[i].consume = (parseFloat(re[i].consume) + allbalance).toFixed(2);
                re[i].CTR = showamount == 0 ? 0.000 : (pointmount / showamount).toFixed(2);
                re[i].bid = re[i].pointmount ? (re[i].consume / re[i].pointmount).toFixed(2) : '0.00';
                re[i].Price_of_thousand = showamount > 999 ? (re[i].consume / parseInt((showamount / 1000).toString())).toFixed(2) : '0.00';
            }
            for (let j = 0; j < re.length; j++) {
                re[j].planname = plan.name;
                re[j].putresource = plan.putresource;
                re[j].dailybudget = plan.dailybudget;
                re[j].startdate = winston_1.timestamps(re[j].startdate);
                if (re[j].enddate != undefined) {
                    re[j].enddate = winston_1.timestamps(re[j].enddate);
                }
            }
            recordsFiltered = yield unit_1.queryunitAllcount(req.app.locals.sequelize, planuuid);
            return response_1.sendOK(res, { re, draw: draw, recordsFiltered: recordsFiltered[0].count });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
function addPlanuuid(currre, controlre, num, planuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < currre.length; i++) {
            let hour = currre[i];
            for (let j = 0 + (num - 1) * 24; j < num * 24; j++) {
                if (controlre[j].ads_week == num) {
                    if (controlre[j].ads_hour == hour) {
                        let exiest = false;
                        if (controlre[j].planuuids) {
                            for (let n = 0; n < controlre[j].planuuids.length; n++) {
                                if (planuuid != controlre[j].planuuids[n]) {
                                    exiest = true;
                                }
                            }
                            if (exiest) {
                                controlre[j].planuuids.push(planuuid);
                            }
                        }
                        else {
                            let controlarr = [];
                            controlarr.push(planuuid);
                            controlre[j].planuuids = controlarr;
                        }
                        controltime_1.updatecomtrotimeByhour(controlre[j]);
                    }
                }
            }
        }
    });
}
function updateadsControltime(req, res, next, planuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let re = yield plan_1.queryplanperiod(req.app.locals.sequelize, planuuid);
        let controlre = yield controltime_1.querycontroltime(req.app.locals.sequelize);
        let period = yield parseFormatperiod(re[0].period);
        if (re[0].status == 0) {
            for (let i = 0; i < period.length; i++) {
                let currre = period[i];
                yield addPlanuuid(currre, controlre, i + 1, planuuid);
            }
        }
        // if (re[0].period[1]) {
        //     let currre: any = re[0].period[1];
        //     await addPlanuuid(currre, controlre, 1, planuuid);
        // } else if (re[0].period[2]) {
        //     let currre: any = re[0].period[2];
        //     await addPlanuuid(currre, controlre, 2, planuuid);
        // } else if (re[0].period[3]) {
        //     let currre: any = re[0].period[3];
        //     await addPlanuuid(currre, controlre, 3, planuuid);
        // } else if (re[0].period[4]) {
        //     let currre: any = re[0].period[4];
        //     await addPlanuuid(currre, controlre, 4, planuuid);
        // } else if (re[0].period[5]) {
        //     let currre: any = re[0].period[5];
        //     await addPlanuuid(currre, controlre, 5, planuuid);
        // } else if (re[0].period[6]) {
        //     let currre: any = re[0].period[6];
        //     await addPlanuuid(currre, controlre, 6, planuuid);
        // } else if (re[0].period[7]) {
        //     let currre: any = re[0].period[7];
        //     await addPlanuuid(currre, controlre, 7, planuuid);
        // }
    });
}
/**
 * 新建plan
 * period:{ 1:[1,2,3,4],2:[],3:[],4:[],5:[],6:[],7:[] }
 */
exports.router.post('/newplan', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //let {name,putresource,dailybudget,startdate,enddate,period,advertiseruuid} = req.query;
        const loginInfo = req.loginInfo;
        if (loginInfo.isAdminRO() || loginInfo.isAdsRO()) {
            return response_1.sendNoPerm(res);
        }
        let body = req.body;
        let name = body.name;
        let putresource = body.putresource;
        let dailybudget = body.dailybudget;
        let startdate = body.startdate;
        let enddate = body.enddate;
        let period = body.period;
        let advertiser = body.advertiseruuid;
        let plan;
        let status = 0;
        if (enddate != -1) {
            plan = {
                name: name,
                putresource: putresource,
                dailybudget: dailybudget,
                startdate: startdate,
                enddate: enddate,
                period: period,
                advertiseruuid: advertiser,
                status: status
            };
            plan.enddate = new Date(plan.enddate);
        }
        else {
            plan = {
                name: name,
                putresource: putresource,
                dailybudget: dailybudget,
                startdate: startdate,
                period: period,
                advertiseruuid: advertiser,
                status: status
            };
        }
        try {
            plan.period = JSON.parse(plan.period);
            plan.putresource = parseInt(plan.putresource);
            plan.startdate = new Date(plan.startdate);
            validator_1.validateCgi(plan, validator_2.planValidator.planobject);
            let plans = yield plan_1.insertplan(plan);
            updateadsControltime(req, res, next, plans.get().uuid);
            return response_1.sendOK(res, { 'plan': plans.get() });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
function parseFormatperiod(period) {
    return __awaiter(this, void 0, void 0, function* () {
        let planarr = [];
        for (let i = 0; i < period.week.length; i++) {
            let planarrweek = [];
            for (let j = 0; j < period.week[i].length; j++) {
                if (period.week[i][j] == 1) {
                    planarrweek.push(j);
                }
            }
            planarr.push(planarrweek);
        }
        return planarr;
    });
}
exports.parseFormatperiod = parseFormatperiod;
exports.router.get('/getplanselect', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        try {
            if (loginInfo.isRoot()) {
                let re = yield plan_1.queryplanselect();
                let planarr = [];
                for (let j = 0; j < re.length; j++) {
                    planarr.push(re[j]);
                }
                return response_1.sendOK(res, planarr);
            }
            else {
                let advertiser = yield advertiser_1.findoneBycrmuuid(loginInfo.getUuid());
                let planarr = [];
                let re = yield plan_1.queryplanselect(advertiser.uuid);
                for (let j = 0; j < re.length; j++) {
                    planarr.push(re[j]);
                }
                return response_1.sendOK(res, planarr);
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.post('/updateplan', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        if (loginInfo.isAdminRO() || loginInfo.isAdsRO()) {
            return response_1.sendNoPerm(res);
        }
        let body = req.body;
        let name = body.name;
        let putresource = body.putresource;
        let dailybudget = body.dailybudget;
        let startdate = body.startdate;
        let enddate = body.enddate;
        let period = body.period;
        let planuuid = body.planuuid;
        try {
            let plan = {
                name: name,
                putresource: putresource,
                dailybudget: dailybudget,
                startdate: startdate,
                enddate: enddate,
                period: period,
                planuuid: planuuid
            };
            validator_1.validateCgi(plan, validator_2.planValidator.planobject);
            plan.period = JSON.parse(plan.period);
            plan.startdate = new Date(plan.startdate);
            plan.enddate = new Date(plan.enddate);
            let re = yield plan_1.updateplan(plan);
            updateadsControltime(req, res, next, planuuid);
            return response_1.sendOK(res, { 'data': re });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/:planuuid/getplanByuuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let planuuid = req.params['planuuid'];
        try {
            validator_1.validateCgi({ uuid: planuuid }, validator_2.planValidator.planuuid);
            let re = yield plan_1.queryplanone(planuuid);
            re.startdate = winston_1.timestamps(re.startdate);
            if (re.enddate != undefined) {
                re.enddate = winston_1.timestamps(re.enddate);
            }
            return response_1.sendOK(res, re);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.post('/planstatus', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        if (loginInfo.isAdminRO() || loginInfo.isAdsRO()) {
            return response_1.sendNoPerm(res);
        }
        let planuuid = req.body.planuuid;
        let status = req.body.status;
        try {
            validator_1.validateCgi({ uuid: planuuid }, validator_2.planValidator.planuuid);
            if (status == 0) {
                let units = yield unit_1.updateunitStatusByplanuuid(planuuid);
                ads_1.undateAdsstatusByunituuids(req.app.locals.sequelize, units);
            }
            let re = yield plan_1.updateplanstatus(planuuid, status);
            return response_1.sendOK(res, { "date": re });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
function downadsStatus(planuuid) {
    return __awaiter(this, void 0, void 0, function* () {
        let units = yield unit_1.findunitByplanuuid(planuuid);
        ads_1.undateAdsstatusByunituuids1(units);
    });
}
exports.downadsStatus = downadsStatus;
exports.router.post('/unitstatus', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        if (loginInfo.isAdminRO() || loginInfo.isAdsRO()) {
            return response_1.sendNoPerm(res);
        }
        let unituuid = req.body.unituuid;
        let status = req.body.status;
        try {
            validator_1.validateCgi({ uuid: unituuid }, validator_2.planValidator.planuuid);
            let re;
            if (status == 1) {
                re = yield unit_1.updateunitstatus(unituuid, status);
                let plan = yield plan_1.queryplanone(re[0].get('planuuid'));
                if (plan.status == 0) {
                    return response_1.sendOK(res, "notxxx");
                }
            }
            if (status == 0) {
                ads_1.updateAdsByunituuid(unituuid);
                re = yield unit_1.updateunitstatus(unituuid, status);
            }
            return response_1.sendOK(res, { "date": re });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
/**
 * 单元名称,推广方式，投放地域，性别，年龄，计费方式，出价
 */
exports.router.post('/newunit', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        if (loginInfo.isAdminRO() || loginInfo.isAdsRO()) {
            return response_1.sendNoPerm(res);
        }
        let body = req.body;
        let name = body.name;
        let mode = body.mode;
        let area = body.area;
        let sex = body.sex;
        let age = body.age;
        let method = body.method;
        let bid = body.bid;
        let planuuid = body.planuuid;
        let cpe_type = body.cpe_type;
        let advertiser = yield advertiser_1.findoneBycrmuuid(loginInfo.getUuid());
        let unit = {
            name: name,
            mode: mode,
            area: area,
            sex: sex,
            age: age,
            method: method,
            bid: bid,
            planuuid: planuuid,
            cpe_type: cpe_type
        };
        let minbid = yield system_1.findByName('minbid');
        if (method == 'cpc' && bid < parseFloat(minbid.content.val_cpc)) {
            return response_1.sendErrMsg(res, "出价太低", 500);
        }
        else if (method == 'cpm' && bid < parseFloat(minbid.content.val_cpm)) {
            return response_1.sendErrMsg(res, "出价太低", 500);
        }
        else if (method == 'cpe' && cpe_type == 1 && bid < parseFloat(minbid.content.val_cpe_click)) { //点击
            return response_1.sendErrMsg(res, "出价太低", 500);
        }
        else if (method == 'cpe' && cpe_type == 0 && bid < parseFloat(minbid.content.val_cpe_show)) {
            return response_1.sendErrMsg(res, "出价太低", 500);
        }
        try {
            unit.mode = parseInt(unit.mode);
            unit.sex = parseInt(unit.sex);
            unit.age = JSON.parse(unit.age);
            unit.age = yield timeformat(unit.age, 1);
            let units = yield unit_1.insertunit(unit);
            let plan = yield plan_1.queryplanone(units.get('planuuid'));
            if (advertiser == undefined) {
                return response_1.sendErrMsg(res, "找不到广告商", 500);
            }
            else {
                let crmuser = yield crmuser_1.findByPrimary(advertiser.crmuuid);
                if (!crmuser)
                    return response_1.sendErrMsg(res, "广告商crm帐号不存在", 500);
                let ads = yield ads_1.insertBeforePutonads(req.app.locals.sequelize, '十金十代', units.get().uuid, advertiser, crmuser.username);
                return response_1.sendOK(res, { "unit": units.get(), "plan": plan, "ads": ads.get() });
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/:planuuid/getunitselect', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let planuuid = req.params['planuuid'];
        try {
            validator_1.validateCgi({ uuid: planuuid }, validator_2.planValidator.planuuid);
            let re = yield unit_1.queryunit(planuuid);
            for (let i = 0; i < re.length; i++) {
                re[i].get().age = yield timeformat(re[i].get().age, 2);
            }
            return response_1.sendOK(res, re);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/:unituuid/getunitByuuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let unituuid = req.params['unituuid'];
        try {
            validator_1.validateCgi({ uuid: unituuid }, validator_2.planValidator.unituuid);
            let re = yield unit_1.queryunitone(unituuid);
            re.age = yield timeformat(re.age, 2);
            let num = 0;
            for (let i = 0; i < re.age.length; i++) {
                if (re.age[i] == 1) {
                    num++;
                }
                if (num == 6) {
                    re.age = -1;
                }
            }
            let plan = yield plan_1.queryplanone(re.planuuid);
            return response_1.sendOK(res, { unit: re, plan: plan });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.post('/updateunit', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        if (loginInfo.isAdminRO() || loginInfo.isAdsRO()) {
            return response_1.sendNoPerm(res);
        }
        let body = req.body;
        let name = body.name;
        let mode = body.mode;
        let area = body.area;
        let sex = body.sex;
        let age = body.age;
        let method = body.method;
        let bid = body.bid;
        let unituuid = body.unituuid;
        let unit = {
            name: name,
            mode: mode,
            area: area,
            sex: sex,
            age: age,
            method: method,
            bid: bid,
            unituuid: unituuid
        };
        try {
            let minbid = yield system_1.findByName('minbid');
            minbid = minbid.content.val;
            if (bid < minbid)
                return response_1.sendErrMsg(res, "出价太低", 500);
            unit.age = JSON.parse(unit.age);
            unit.age = yield timeformat(unit.age, 1);
            let re = yield unit_1.updateunit(unit);
            return response_1.sendOK(res, re);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
const time = { "time": [[0, 18], [19, 24], [25, 29], [30, 39], [40, 49], [50, 1000]] };
function timeformat(timeJson, mode) {
    return __awaiter(this, void 0, void 0, function* () {
        //如果是前端打来后端就mode==1
        //timeJson =[0,0,0,0,0,0]
        if (mode == 1) {
            let temptime = [];
            for (let i = 0; i < time.time.length; i++) {
                if (timeJson[i] == 1) {
                    temptime.push(time.time[i]);
                }
            }
            return temptime;
        }
        else if (mode == 2) {
            //如果后端 打给前端用来回显  mode==2
            //timeJson =[[0,18],[19,24],[25,29],[30,39],[40,49],[50,1000]]
            let temptime = [];
            if (timeJson != null && timeJson.length != 0 && timeJson != undefined) {
                for (let i = 0; i < time.time.length; i++) {
                    if (timeJson[i] != undefined) {
                        if (timeJson[i][0] == time.time[i][0] && timeJson[i][1] == time.time[i][1]) {
                            temptime.push(1);
                        }
                        else {
                            temptime.push(0);
                        }
                    }
                }
                return temptime;
            }
            return [0, 0, 0, 0, 0, 0];
        }
        else {
            return undefined;
        }
    });
}
exports.timeformat = timeformat;
exports.router.get('/getadsAll', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        let start = req.query.start;
        let length = req.query.length;
        let draw = req.query.draw;
        let advertiseruuid = req.query.advertiseruuid;
        let recordsFiltered;
        let search = req.query.search;
        let searchdata = search.value;
        try {
            if (loginInfo.isRoot()) {
                if (advertiseruuid == null) {
                    let re = yield ads_1.queryadvertiserAdsBypage(searchdata, parseInt(start), parseInt(length));
                    let unit = yield unit_1.queryunitByuuids(req.app.locals.sequelize, re);
                    for (let i = 0; i < re.length; i++) {
                        for (let j = 0; j < unit.length; j++) {
                            if (re[i].unituuid == unit[j].uuid) {
                                re[i].method = unit[j].method;
                                if (unit[j].method == 'cpc') {
                                    re[i].consume = (parseFloat(unit[j].bid) * parseInt(re[i].pointmount)).toFixed(2);
                                }
                                else if (unit[j].method == 'cpm') {
                                    re[i].consume = (parseFloat(unit[j].bid) * parseInt((re[i].showamount / 1000).toString())).toFixed(2);
                                }
                                else if (unit[j].method == 'cpe') {
                                    if (unit[j].cpe_type == 0) {
                                        re[i].consume = (parseInt((re[i].showamount / 1000).toString()) * parseFloat(unit[j].bid)).toFixed(2);
                                    }
                                    else if (unit[j].cpe_type == 1) {
                                        re[i].consume = (re[i].pointmount * parseFloat(unit[j].bid)).toFixed(2);
                                    }
                                    else {
                                        re[i].consume = (parseInt((re[i].showamount / 1000).toString()) * parseFloat(unit[j].bid)).toFixed(2);
                                        re[i].consume = (unit[j].consume + re[i].pointmount * parseFloat(unit[j].bid)).toFixed(2);
                                    }
                                }
                                //re[i].consume = (parseFloat(unit[j].bid) * parseInt(re[i].pointmount)).toFixed(2);
                                re[i].bid = unit[j].bid;
                                //re[i].Price_of_thousand = parseInt(re[i].showamount) ==0 ?0: ((parseInt(re[i].pointmount) / parseInt(re[i].showamount)) * parseFloat(unit[j].bid) * 1000).toFixed(2);
                                re[i].Price_of_thousand = parseInt((parseInt(re[i].showamount) / 1000).toString()) * parseFloat(unit[j].bid);
                                re[i].mode = unit[j].mode;
                            }
                        }
                        re[i].CTR = parseInt(re[i].showamount) == 0 ? 0.000 : (parseInt(re[i].pointmount) / parseInt(re[i].showamount)).toFixed(2);
                    }
                    let view = yield ads_ext_1.getview();
                    for (let i = 0; i < re.length; i++) {
                        for (let j = 0; j < view.length; j++) {
                            if (re[i].uuid == view[j].uuid) {
                                re[i].view = view[j].virtviews;
                            }
                        }
                    }
                    recordsFiltered = yield ads_1.queryadvertiserAdsBypagecount(req.app.locals.sequelize);
                    return response_1.sendOK(res, { re, draw: draw, recordsFiltered: recordsFiltered[0].count });
                }
                else {
                    let re = yield ads_1.queryadvertiserAdsBypage(searchdata, parseInt(start), parseInt(length), advertiseruuid);
                    let unit = yield unit_1.queryunitByuuids(req.app.locals.sequelize, re);
                    for (let i = 0; i < re.length; i++) {
                        for (let j = 0; j < unit.length; j++) {
                            if (re[i].unituuid == unit[j].uuid) {
                                re[i].method = unit[j].method;
                                if (unit[j].method == 'cpc') {
                                    re[i].consume = (parseFloat(unit[j].bid) * parseInt(re[i].pointmount)).toFixed(2);
                                }
                                else if (unit[j].method == 'cpm') {
                                    re[i].consume = (parseFloat(unit[j].bid) * parseInt((re[i].showamount / 1000).toString())).toFixed(2);
                                }
                                else if (unit[j].method == 'cpe') {
                                    if (unit[j].cpe_type != undefined) {
                                        if (unit[j].cpe_type == 0) {
                                            re[i].consume = (parseInt((re[i].showamount / 1000).toString()) * parseFloat(unit[j].bid)).toFixed(2);
                                        }
                                        else if (unit[j].cpe_type == 1) {
                                            re[i].consume = (re[i].pointmount * parseFloat(unit[j].bid)).toFixed(2);
                                        }
                                        else {
                                            re[i].consume = (parseInt((re[i].showamount / 1000).toString()) * parseFloat(unit[j].bid)).toFixed(2);
                                            re[i].consume = (unit[j].consume + re[j].pointmount * parseFloat(unit[j].bid)).toFixed(2);
                                        }
                                    }
                                }
                                //re[i].consume = (parseFloat(unit[j].bid) * parseInt(re[i].pointmount)).toFixed(2);
                                re[i].bid = unit[j].bid;
                                //re[i].Price_of_thousand = parseInt(re[i].showamount) ==0 ?0: ((parseInt(re[i].pointmount) / parseInt(re[i].showamount)) * parseFloat(unit[j].bid) * 1000).toFixed(2);
                                re[i].Price_of_thousand = parseInt((parseInt(re[i].showamount) / 1000).toString()) * parseFloat(unit[j].bid);
                                re[i].mode = unit[j].mode;
                            }
                        }
                        re[i].CTR = parseInt(re[i].showamount) == 0 ? 0.000 : (parseInt(re[i].pointmount) / parseInt(re[i].showamount)).toFixed(2);
                    }
                    let view = yield ads_ext_1.getview();
                    for (let i = 0; i < re.length; i++) {
                        for (let j = 0; j < view.length; j++) {
                            if (re[i].uuid == view[j].uuid) {
                                re[i].view = view[j].virtviews;
                            }
                        }
                    }
                    recordsFiltered = yield ads_1.queryadvertiserAdsBypagecount(req.app.locals.sequelize, advertiseruuid);
                    return response_1.sendOK(res, { re, draw: draw, recordsFiltered: recordsFiltered[0].count });
                }
            }
            let re = yield ads_1.queryadvertiserAdsBypage(searchdata, parseInt(start), parseInt(length), advertiseruuid);
            let unit = yield unit_1.queryunitByuuids(req.app.locals.sequelize, re);
            for (let i = 0; i < re.length; i++) {
                for (let j = 0; j < unit.length; j++) {
                    if (re[i].unituuid == unit[j].uuid) {
                        re[i].method = unit[j].method;
                        if (unit[j].method == 'cpc') {
                            re[i].consume = (parseFloat(unit[j].bid) * parseInt(re[i].pointmount)).toFixed(2);
                        }
                        else if (unit[j].method == 'cpm') {
                            re[i].consume = (parseFloat(unit[j].bid) * parseInt((re[i].showamount / 1000).toString())).toFixed(2);
                        }
                        else if (unit[j].method == 'cpe') {
                            if (unit[j].cpe_type) {
                                if (unit[j].cpe_type == 0) {
                                    re[i].consume = (parseInt((re[i].showamount / 1000).toString()) * parseFloat(unit[j].bid)).toFixed(2);
                                }
                                else if (unit[j].cpe_type == 1) {
                                    re[i].consume = (re[i].pointmount * parseFloat(unit[j].bid)).toFixed(2);
                                }
                                else {
                                    re[i].consume = (parseInt((re[i].showamount / 1000).toString()) * parseFloat(unit[j].bid)).toFixed(2);
                                    re[i].consume = (unit[j].consume + re[i].pointmount * parseFloat(unit[j].bid)).toFixed(2);
                                }
                            }
                            else {
                                re[i].consume = "0.00";
                            }
                        }
                        // re[i].consume = (parseFloat(unit[j].bid) * parseInt(re[i].pointmount)).toFixed(2);
                        re[i].bid = unit[j].bid;
                        //re[i].Price_of_thousand = parseInt(re[i].showamount) ==0 ?0:((parseInt(re[i].pointmount) / parseInt(re[i].showamount)) * parseFloat(unit[j].bid) * 1000).toFixed(2);
                        re[i].Price_of_thousand = parseInt((parseInt(re[i].showamount) / 1000).toString()) * parseFloat(unit[j].bid);
                        re[i].mode = unit[j].mode;
                    }
                }
                re[i].CTR = parseInt(re[i].showamount) == 0 ? 0.000 : (parseInt(re[i].pointmount) / parseInt(re[i].showamount)).toFixed(2);
            }
            let view = yield ads_ext_1.getview();
            for (let i = 0; i < re.length; i++) {
                for (let j = 0; j < view.length; j++) {
                    if (re[i].uuid == view[j].uuid) {
                        re[i].view = view[j].virtviews;
                    }
                }
            }
            recordsFiltered = yield ads_1.queryadvertiserAdsBypagecount(req.app.locals.sequelize, advertiseruuid);
            return response_1.sendOK(res, { re, draw: draw, recordsFiltered: recordsFiltered[0].count });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/:unituuid/getadsAll', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let unituuid = req.params['unituuid'];
        let start = req.query.start;
        let length = req.query.length;
        let draw = req.query.draw;
        let recordsFiltered;
        try {
            let re = yield ads_1.queryadsByunituuid(parseInt(start), parseInt(length), unituuid);
            let unit = yield unit_1.queryunitByuuids(req.app.locals.sequelize, re);
            for (let i = 0; i < re.length; i++) {
                for (let j = 0; j < unit.length; j++) {
                    if (re[i].unituuid == unit[j].uuid) {
                        re[i].method = unit[j].method;
                        if (unit[j].method == 'cpc') {
                            re[i].consume = (parseFloat(unit[j].bid) * parseInt(re[i].pointmount)).toFixed(2);
                        }
                        else if (unit[j].method == 'cpm') {
                            re[i].consume = (parseFloat(unit[j].bid) * parseInt((re[i].showamount / 1000).toString())).toFixed(2);
                        }
                        else if (unit[j].method == 'cpe') {
                            if (unit[j].cpe_type == 0) {
                                re[i].consume = (parseInt((re[i].showamount / 1000).toString()) * parseFloat(unit[j].bid)).toFixed(2);
                            }
                            else if (unit[j].cpe_type == 1) {
                                re[i].consume = (re[i].pointmount * parseFloat(unit[j].bid)).toFixed(2);
                            }
                            else {
                                re[i].consume = (parseInt((re[i].showamount / 1000).toString()) * parseFloat(unit[j].bid)).toFixed(2);
                                re[i].consume = (unit[j].consume + re[i].pointmount * parseFloat(unit[j].bid)).toFixed(2);
                            }
                        }
                        re[i].consume = (parseFloat(re[i].consume) + (re[i].allbalance ? re[i].allbalance : 0)).toFixed(2);
                        re[i].bid = re[i].pointmount ? (re[i].consume / re[i].pointmount).toFixed(2) : '0.00';
                        re[i].Price_of_thousand = re[i].showamount > 999 ? (re[i].consume / parseInt((parseInt(re[i].showamount) / 1000).toString())).toFixed(2) : '0.00';
                        re[i].mode = unit[j].mode;
                    }
                }
                re[i].CTR = parseInt(re[i].showamount) == 0 ? 0 : (parseInt(re[i].pointmount) / parseInt(re[i].showamount)).toFixed(2);
            }
            let view = yield ads_ext_1.getview();
            for (let i = 0; i < re.length; i++) {
                for (let j = 0; j < view.length; j++) {
                    if (re[i].uuid == view[j].uuid) {
                        re[i].view = view[j].virtviews;
                    }
                }
            }
            let plan = yield unit_1.queryunitone(unituuid);
            recordsFiltered = yield ads_1.queryadsByunituuidcount(req.app.locals.sequelize, unituuid);
            return response_1.sendOK(res, { re, plan, draw: draw, recordsFiltered: recordsFiltered[0].count });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.delete('/:unituuid/deleteunit', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        if (loginInfo.isAdminRO() || loginInfo.isAdsRO()) {
            return response_1.sendNoPerm(res);
        }
        let unituuid = req.params['unituuid'];
        try {
            unit_1.delelteunitByuuid(req.app.locals.sequelize, unituuid);
            let adss = yield ads_1.findadsByunituuid(unituuid);
            adsoperation_1.deleteadsByadsuuids(req.app.locals.sequelize, adss);
            ads_1.deleteadsByunituuid(req.app.locals.sequelize, unituuid);
            return response_1.sendOK(res, { 'date': 'succ' });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.delete('/:planuuid/deleteplan', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginInfo = req.loginInfo;
        if (loginInfo.isAdminRO() || loginInfo.isAdsRO()) {
            return response_1.sendNoPerm(res);
        }
        let planuuid = req.params['planuuid'];
        try {
            let unit = yield unit_1.queryunitByplan(planuuid);
            yield plan_1.deleteplanByuuid(req.app.locals.sequelize, planuuid);
            for (let i = 0; i < unit.length; i++) {
                if (unit[i] != undefined) {
                    yield unit_1.delelteunitByuuid(req.app.locals.sequelize, unit[i].uuid);
                    let adss = yield ads_1.findadsByunituuid(unit[i].uuid);
                    adsoperation_1.deleteadsByadsuuids(req.app.locals.sequelize, adss);
                    yield ads_1.deleteadsByunituuid(req.app.locals.sequelize, unit[i].uuid);
                }
            }
            return response_1.sendOK(res, { 'date': 'succ' });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=puton.js.map