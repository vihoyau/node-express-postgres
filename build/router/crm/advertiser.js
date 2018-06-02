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
const advertiser_1 = require("../../model/ads/advertiser");
const crmuser_1 = require("../../model/ads/crmuser");
exports.router = express_1.Router();
//新添加
const crmuser_2 = require("../../model/ads/crmuser");
const users_ext_1 = require("../../model/users/users_ext");
const incomemoney_1 = require("../../model/ads/incomemoney");
//添加广告商信息
exports.router.post('/adv', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { company, contacts, description, phone, licence, state, address, points, totalpoints } = req.body;
        try {
            const info = req.loginInfo;
            if (!info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            let tmp = {
                company: company,
                contacts: contacts,
                description: description,
                phone: phone,
                licence: licence,
                state: state,
                address: address,
                points: points,
                totalpoints: totalpoints,
            };
            // validateCgi(tmp, advertiserValidator.advertiserInfo)
            let advertisers = yield advertiser_1.addAdvertiser(tmp);
            return response_1.sendOK(res, advertisers);
        }
        catch (e) {
            response_1.sendError(res, e);
        }
    });
});
//添加个人和企业的广告商信息 (提交资料)
exports.router.post('/newadv', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { contacts, description, phone, state, address, points, totalpoints, qq, zipcode, email, types, created, modified, ext, company, websitename, websiteaddr, licence } = req.body;
        let imgarr = req.body['imgarr[]']; //传入照片[数组]的编码方式
        //企业广告商：公司名 网站名称 网站URL  营业执照注册号 营业执照照片
        //个人广告商： 身份证 身份证图片
        let { idcard } = req.body;
        try {
            const info = req.loginInfo;
            if (!info.isAppUser()) //验证是否为非广告商用户
                return response_1.sendNoPerm(res);
            let obj = {
                contacts: contacts,
                description: description,
                phone: phone,
                state: state,
                address: address,
                points: !!points ? parseInt(points) : 0,
                totalpoints: !!totalpoints ? parseInt(totalpoints) : 0,
                qq: qq,
                created: created,
                modified: modified,
                zipcode: zipcode,
                email: email,
                types: parseInt(types),
                ext: ext,
                //审核状态
                audit: 0,
                //备注
                remark: "待审核",
                crmuuid: info.getUuid() //插入crmuuid进入广告商的记录中
            };
            //创建企业广告商
            if (types == 1) {
                let imgarr1 = new Array();
                imgarr1[0] = imgarr;
                obj.imgarr = imgarr1;
                obj.company = company; //公司名
                let ads_company = yield advertiser_1.findAdv_company_Info(); //查找广告商的company字段的所有值
                let num = ads_company.length;
                for (let i = 0; i < num; i++) {
                    if (obj.company == ads_company[i].company)
                        return response_1.sendErrMsg(res, "公司名重复！", 409);
                }
                obj.websitename = websitename; //网站名
                obj.websiteaddr = websiteaddr; //网站URL
                obj.licence = licence;
                //创建新的广告商
                let crmuuid = info.getUuid(); //取得登录的uuid
                //创建新的广告商
                let addAdvertiserstate = yield advertiser_1.addAdvertiser(obj);
                //取得crm用户管理的广告商的信息
                let keys = yield crmuser_2.findBymgruuids(crmuuid);
                //增添新的广告商的uuid到中间数组的缓存中
                let newArr = new Array();
                if (keys.mgruuids != null) {
                    if (keys.mgruuids.length > 0) {
                        newArr = keys.mgruuids;
                        newArr.push(addAdvertiserstate.uuid);
                    }
                    else {
                        newArr[0] = addAdvertiserstate.uuid;
                    }
                }
                //这里的crmuuid是crm用户的ID，插入广告商的addAdvertiserstate.uuid到crm用户的mgruuids字段中，成为可以管理的广告商
                yield crmuser_2.inserMgruuids(info.getUuid(), newArr);
                return response_1.sendOK(res, { "data": "添加企业广告商信息成功,请留意审核状态" });
            }
            //创建个人广告商
            if (types == 0) { //待审核状态
                obj.idcard = idcard; //身份证
                obj.imgarr = imgarr;
                let crmuuid = info.getUuid();
                //创建新的广告商
                let addAdvertiserstate = yield advertiser_1.addAdvertiser(obj);
                //取得crm用户管理的广告商的信息
                let keys = yield crmuser_2.findBymgruuids(crmuuid);
                //增添新的广告商的uuid到中间数组的缓存中
                let newArr = new Array();
                if (keys.mgruuids != null) {
                    if (keys.mgruuids.length > 0) {
                        newArr = keys.mgruuids;
                        newArr.push(addAdvertiserstate.uuid);
                    }
                    else {
                        newArr[0] = addAdvertiserstate.uuid;
                    }
                }
                yield crmuser_2.inserMgruuids(info.getUuid(), newArr);
                return response_1.sendOK(res, { "data": "添加个人广告商信息成功,请留意审核状态" });
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//待审核列表查询： audit ：0
exports.router.get("/list/all", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const info = req.loginInfo;
            if (!info.isRoot() && !info.isAdminRO() && !info.isAdminRW()) //只有root的用户才能查看待审核的列表
                return response_1.sendNoPerm(res);
            //root用户查看所有的待审核的列表
            if (info.isRoot()) {
                let advertiser = yield advertiser_1.new_findAdvInfo(); //得到待审核的列表
                return response_1.sendOK(res, { advertiser: advertiser }); //返回审核的列表
            }
            let adver = new Array();
            if (info.isAdminRO() || info.isAdminRW()) {
                let keys = yield crmuser_2.findBymgruuids(info.getUuid());
                if (!keys.mgruuids) {
                    return response_1.sendOK(res, { advertiser: {} }); //返回审核的列表
                }
                let num = keys.mgruuids.length;
                for (let i = 0; i < num; i++) {
                    let advertiser = yield advertiser_1.find_perm_AdvInfo(keys.mgruuids[i]); //得到单个广告商待审核的列表
                    adver[i] = advertiser;
                }
                return response_1.sendOK(res, { advertiser: adver }); //返回审核的列表
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//广告商用户查看自己的ads.incomemoney表的信息
exports.router.get("/incomemoney", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const info = req.loginInfo;
            if (!info.isAdvertiserRW()) //只有广告商权限的crm用户才能查看incomemoney列表的信息
                return response_1.sendNoPerm(res);
            let incomemoney = yield incomemoney_1.find_one_incomemoney(info.getUuid()); //得到incomemoney列表的信息
            return response_1.sendOK(res, { incomemoney: incomemoney }); //返回incomemoney列表信息
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//获取某个广告商记录查询： 包括待审核,审核通过，审核不通过  //通过crmuuid来查看广告商的记录
exports.router.get('/:crmuuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const crmuuid = req.params["crmuuid"]; //express 的 API ---- request的使用
        try {
            const info = req.loginInfo;
            //              validateCgi({ uuid: uuid }, advertiserValidator.UUID)
            if (!info.isAppUser() && !info.isAdvertiserRW()) //只有root的用户据可以登录
                return response_1.sendNoPerm(res);
            let advertiser = yield crmuser_2.findBymgruuids(crmuuid); //查找CRM的记录
            if (!advertiser.mgruuids || !advertiser.mgruuids[0])
                return response_1.sendOK(res, "暂无申请任何广告商"); //没有添加过广告商，返回空字符串
            let ads = yield advertiser_1.findByPrimary(advertiser.mgruuids[0]); //只查看一个广告商
            let user_ext_info = yield advertiser_1.find_one_users_ext_table_information(crmuuid);
            ads.points = user_ext_info.crm_points;
            return response_1.sendOK(res, ads);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//获取users_ext表的全部信息
exports.router.get('/users/ext', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const info = req.loginInfo;
            //              validateCgi({ uuid: uuid }, advertiserValidator.UUID)
            if (!info.isRoot()) //只有root的用户据可以登录
                return response_1.sendNoPerm(res);
            let users_ext = yield advertiser_1.find_users_ext_table_information(); //取得users.users_ext的全部信息
            return response_1.sendOK(res, { users_ext: users_ext }); //返回users_ext的信息
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//通过crmuuid 获取自己的users_ext表的全部信息
exports.router.get('/users/ext/:crmuuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const crmuuid = req.params["crmuuid"];
        try {
            const info = req.loginInfo;
            //              validateCgi({ uuid: uuid }, advertiserValidator.UUID)
            if (!info.isAdvertiserRW()) //只有广告商的用户据可以登录
                return response_1.sendNoPerm(res);
            let users_ext = yield advertiser_1.find_one_users_ext_table_information(crmuuid); //取得广告商的自己的信息
            return response_1.sendOK(res, { users_ext: users_ext }); //返回users_ext的信息
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//root用户审核广告商
exports.router.post('/root', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { uuid, audit, remark, margin, expenses } = req.body; //广告商的uuid 审核状态 备注
        let perm = { "advertiserRW": 1 }; //广告商权限
        try {
            const info = req.loginInfo;
            //              validateCgi({ uuid: uuid }, advertiserValidator.UUID)
            if (!info.isRoot() && !info.isAdminRW()) //只有root的用户据可以登录
                return response_1.sendNoPerm(res);
            if (parseInt(audit) == 1) { //审核通过
                let advertiser = yield advertiser_1.findByPrimary(uuid); //查看广告商申请的信息
                advertiser.audit = parseInt(audit);
                let updateads1 = yield advertiser_1.modifyAudit(uuid, advertiser.audit); //更新审核状态
                updateads1.remark = remark;
                let updateads2 = yield advertiser_1.modifyRemark(uuid, updateads1.remark); //更新备注
                yield crmuser_2.updateperm(updateads2.crmuuid, perm); //更新用户的权限为广告商用户
                yield users_ext_1.modifyMargin(updateads2.crmuuid, margin); //插入margin字段值到"users_ext" (保证金)
                yield users_ext_1.updatebalance_and_total_balance(updateads2.crmuuid, expenses); //更新余额和历史总金额
                /*             let crm_balance_info = await  find_one_users_ext_table_information(updateads2.crmuuid)        //查找总余额
                            console.log(crm_balance_info)
                            let upcrm =await modifybalance(uuid,crm_balance_info.crm_balance)
                            console.log(crm_balance_info.crm_balance)                      //更新广告商的总余额
                            console.log(upcrm)
                            if (crm_balance_info.crm_balance <= 0) {
                                crm_balance_info.balance_state = 2
                                await modifybalance_state(uuid,crm_balance_info.balance_state)      //余额不足
                            } else {
                                crm_balance_info.balance_state = 1
                                await modifybalance_state(uuid,crm_balance_info.balance_state)
                            } */
                /*             updateads2.margin = parseInt(margin)
                             let updateads3 = await modifyMargin(uuid, updateads2.margin) //更新保证金
                            updateads3.expenses = await parseInt(expenses)
                            let updateads4 = await modifyExpenses(uuid, updateads3.expenses) //更新保证金 */
                //创建入金表的单条记录
                let incomemoney = {
                    useruuid: updateads2.crmuuid,
                    money: expenses,
                    method: "广告商预存费用"
                };
                yield incomemoney_1.create_one_incomemoney(incomemoney); //创建单个incomemoney的记录
                return response_1.sendOK(res, "审核成功");
            }
            if (parseInt(audit) == 2) { //审核不通过
                let advertiser = yield advertiser_1.findByPrimary(uuid); //查看广告商申请的信息
                advertiser.audit = parseInt(audit);
                let updateads1 = yield advertiser_1.modifyAudit(uuid, advertiser.audit); //更新审核状态
                updateads1.remark = remark;
                yield advertiser_1.modifyRemark(uuid, updateads1.remark); //更新备注
                return response_1.sendOK(res, "审核成功"); //查看是否更新成功
            }
            //       return sendOK(res,  "审核完成")
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get("/advertiserInfo", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { start, length, draw, search } = req.query;
        try {
            let searchdata = search.value;
            const info = req.loginInfo;
            if (!info.isRoot())
                return response_1.sendNoPerm(res);
            validator_1.validateCgi({ start: start, length: length, searchdata: undefined }, validator_2.advertiserValidator.pagination);
            let obj = {};
            if (searchdata) {
                obj = {
                    $or: [
                        { company: { $like: '%' + searchdata + '%' } },
                        { contacts: { $like: '%' + searchdata + '%' } }
                    ]
                };
            }
            let recordsFiltered = yield advertiser_1.getCount(searchdata);
            let advertiser = yield advertiser_1.findAdvInfo(obj, parseInt(start), parseInt(length));
            return response_1.sendOK(res, { advertiser: advertiser, draw: draw, recordsFiltered: recordsFiltered });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
exports.router.get('/', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { start, length, draw, search } = req.query;
        try {
            let searchdata = search.value;
            const info = req.loginInfo;
            if (info.isAdsRO() || info.isAdsRW())
                return response_1.sendNoPerm(res);
            if (info.isAdvertiserRW())
                return response_1.sendNoPerm(res);
            validator_1.validateCgi({ start: start, length: length, searchdata: undefined }, validator_2.advertiserValidator.pagination);
            if (info.isRoot()) {
                let recordsFiltered = yield advertiser_1.getCount(searchdata);
                let advertiser = yield advertiser_1.getAll(searchdata, parseInt(start), parseInt(length));
                for (let i = 0; i < advertiser.length; i++) {
                    let user_ext_info = yield advertiser_1.find_one_users_ext_table_information(advertiser[i].crmuuid); //总余额
                    let crmuser = yield crmuser_1.findByPrimary(advertiser[i].crmuuid);
                    if (!user_ext_info)
                        continue;
                    advertiser[i].balance = (user_ext_info.crm_balance / 100).toFixed(2);
                    advertiser[i].points = user_ext_info.crm_points;
                    if (crmuser)
                        advertiser[i].username = crmuser.username;
                    //advertiser[i].crm_balance_state = [user_ext_info.crm_balance_state[0], (((user_ext_info.crm_balance_state[1]) / 100).toFixed(2))]
                    advertiser[i].crm_balance_state = [user_ext_info.crm_balance_state[0], (((user_ext_info.crm_balance_state[1]) / 100).toFixed(2))];
                    if (advertiser[i].balance <= 0) {
                        advertiser[i].balance_state = 2; //余额不足
                    }
                    else {
                        advertiser[i].balance_state = 1;
                    }
                }
                return response_1.sendOK(res, { advertiser: advertiser, draw: draw, recordsFiltered: recordsFiltered });
            }
            else if (info.isAdminRW() || info.isAdminRO()) {
                let advertiseruuid = yield crmuser_1.queryadvByuuid(info.getUuid());
                if (!advertiseruuid.get().mgruuids) {
                    return response_1.sendOK(res, { advertiser: {}, draw: draw });
                }
                let recordsFiltered = yield advertiser_1.getCount(searchdata, advertiseruuid.get('mgruuids'));
                let advertiser = yield advertiser_1.getAll(searchdata, parseInt(start), parseInt(length), advertiseruuid.get('mgruuids'));
                for (let i = 0; i < advertiser.length; i++) {
                    let user_ext_info = yield advertiser_1.find_one_users_ext_table_information(advertiser[i].crmuuid); //总余额
                    let crmuser = yield crmuser_1.findByPrimary(advertiser[i].crmuuid);
                    if (!user_ext_info)
                        continue;
                    advertiser[i].balance = (user_ext_info.crm_balance / 100).toFixed(2);
                    advertiser[i].points = user_ext_info.crm_points;
                    if (crmuser)
                        advertiser[i].username = crmuser.username;
                    //advertiser[i].crm_balance_state = [0,user_ext_info.crm_balance_state[1], (((user_ext_info.crm_balance_state[2]) / 100).toFixed(2))]
                    advertiser[i].crm_balance_state = [user_ext_info.crm_balance_state[0], (user_ext_info.crm_balance_state[1] / 100).toFixed(2), user_ext_info.crm_balance_state[2]];
                    if (advertiser[i].balance <= 0) {
                        advertiser[i].balance_state = 2; //余额不足
                    }
                    else {
                        advertiser[i].balance_state = 1;
                    }
                }
                return response_1.sendOK(res, { advertiser: advertiser, draw: draw, recordsFiltered: recordsFiltered });
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//广告商审核信息修改功能
exports.router.post('/modify/information', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { uuid, contacts, description, phone, state, address, qq, zipcode, email, types, company, websitename, websiteaddr, idcard, licence, created, modified } = req.body;
        let imgarr = req.body['imgarr[]'];
        try {
            /*         validateCgi({
                        advType: advType, company: company, contacts: contacts, description: description, phone: phone,
                        state: state, address: address, points: points, totalpoints: totalpoints
                    }, advertiserValidator.updteadv) */
            const info = req.loginInfo;
            if (!info.isAppUser()) //验证是否为非广告商用户
                return response_1.sendNoPerm(res);
            let ads = yield advertiser_1.findByPrimary(uuid); //查找广告商
            //更新广告商
            ads.contacts = contacts,
                ads.description = description,
                ads.phone = phone,
                ads.imgarr = imgarr,
                ads.state = state,
                ads.address = address,
                ads.qq = qq,
                ads.zipcode = zipcode,
                ads.email = email,
                ads.company = company,
                ads.websitename = websitename,
                ads.websiteaddr = websiteaddr,
                ads.licence = licence,
                ads.idcard = idcard,
                ads.types = parseInt(types),
                ads.created = created,
                ads.modified = modified,
                ads.audit = 0,
                ads.remark = "";
            let ads_company = yield advertiser_1.findAdv_company_Info(); //查找广告商的company字段的所有值
            let num = ads_company.length;
            for (let i = 0; i < num; i++) {
                if (ads.company == ads_company[i].company)
                    return response_1.sendErrMsg(res, "公司名重复！", 409);
            }
            // }
            // let result = await modifiedAdvertise(getopt)
            // validateCgi(ads, advertiserValidator.advertiserInfo)
            yield advertiser_1.updateAdvertiser(ads, ads.uuid);
            return response_1.sendOK(res, { "data": "广告商审核信息修改成功" });
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//root或adminRW修改广告商信息
exports.router.put('/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let uuid = req.params["uuid"]; //广告商的uuid
        let { contacts, description, phone, points, totalpoints } = req.body;
        let { state, address, company, rent } = req.body;
        try {
            /*         validateCgi({
                        advType: advType, company: company, contacts: contacts, description: description, phone: phone,
                        state: state, address: address, points: points, totalpoints: totalpoints
                    }, advertiserValidator.updteadv) */
            const info = req.loginInfo;
            if (!info.isRoot() && !info.isAdminRW) //root和adminRW的权限才能执行之后的功能
                return response_1.sendNoPerm(res);
            let ads = yield advertiser_1.findByPrimary(uuid); //查找广告商
            //更新广告商
            ads.contacts = contacts,
                ads.description = description,
                ads.phone = phone,
                ads.state = state,
                ads.address = address,
                ads.points = points ? parseInt(points) : 0,
                ads.totalpoints = totalpoints,
                ads.rent = parseInt(rent);
            if (ads.types == 1) {
                ads.company = company;
                let ads_company = yield advertiser_1.findAdv_company_Info(); //查找广告商的company字段的所有值
                let num = ads_company.length;
                for (let i = 0; i < num; i++) {
                    if (ads.company == ads_company[i].company) {
                        return response_1.sendErrMsg(res, "公司名重复！", 409);
                    }
                }
            }
            yield advertiser_1.updateAdvertiser(ads, ads.uuid); //更新广告商信息
            let crm_info = yield crmuser_2.findBymgruuids(ads.crmuuid); //更新crmuser的state状态
            crm_info.state = state;
            yield crmuser_1.resetState(crm_info.uuid, crm_info.state);
            let result = ads;
            return response_1.sendOK(res, result);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//(充值操作)
exports.router.put('/modify_crm_balance/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let uuid = req.params.uuid;
        let { crm_balance_recharge, crm_points_recharge } = req.body;
        try {
            const info = req.loginInfo;
            if (!info.isRoot() && !info.isAdminRW) //root和adminRW的权限才能执行之后的功能
                return response_1.sendNoPerm(res);
            //root的用户审核更新总余额
            if (info.isRoot()) {
                let adv_info = yield advertiser_1.findByPrimary(uuid); //crmuser信息
                let user_ext_info = yield users_ext_1.finduuid(adv_info.crmuuid); //找到相对应的余额表信息
                if ((user_ext_info.crm_balance_state)[0] == 1) { //admin没审核的时候执行此步骤
                    yield users_ext_1.modify_crm_balance(adv_info.crmuuid, parseFloat(crm_balance_recharge) * 100); //更新总余额
                    yield users_ext_1.update_crm_total_balance(adv_info.crmuuid, parseFloat(crm_balance_recharge) * 100);
                    yield users_ext_1.modify_crm_point(adv_info.crmuuid, crm_points_recharge); //更新总积分
                    let user_ext_update_info = yield users_ext_1.modify_crm_balance_state(adv_info.crmuuid, [2, 0, 0]); //更新审核总余额状态为2  : 表示审核通过
                    return response_1.sendOK(res, { crm_balance_state: user_ext_update_info.crm_balance_state }); //返回审核字段的信息
                }
                else if ((user_ext_info.crm_balance_state)[0] == 0) { //admin审核了的时候执行此步骤
                    //await modify_crm_balance_state(adv_info.crmuuid,[0,parseFloat(balance) * 100])              //审核余额状态填充，第一个元素表示状态：0：admin审核过的 1：admin没审核的 2:审核通过
                    yield users_ext_1.modify_crm_balance(adv_info.crmuuid, (user_ext_info.crm_balance_state)[1]); //取审核状态的值来更新总余额
                    yield users_ext_1.update_crm_total_balance(adv_info.crmuuid, (user_ext_info.crm_balance_state)[1]); //取审核状态的值来更新历史总余额
                    yield users_ext_1.modify_crm_point(adv_info.crmuuid, (user_ext_info.crm_balance_state)[2]);
                    let user_ext_update_info = yield users_ext_1.modify_crm_balance_state(adv_info.crmuuid, [2, 0, 0]); //更新审核总余额状态为2  : 表示审核通过
                    return response_1.sendOK(res, { crm_balance_state: user_ext_update_info.crm_balance_state }); //返回审核字段的信息
                }
                else if ((user_ext_info.crm_balance_state)[0] == 2) { //root再次审核该广告商(该广告商没有给adminRW审核)
                    yield users_ext_1.modify_crm_balance(adv_info.crmuuid, parseFloat(crm_balance_recharge) * 100); //更新总余额
                    yield users_ext_1.update_crm_total_balance(adv_info.crmuuid, parseFloat(crm_balance_recharge) * 100);
                    yield users_ext_1.modify_crm_point(adv_info.crmuuid, crm_points_recharge);
                    let user_ext_update_info = yield users_ext_1.modify_crm_balance_state(adv_info.crmuuid, [2, 0, 0]); //更新审核总余额状态为2  : 表示审核通过
                    return response_1.sendOK(res, { crm_balance_state: user_ext_update_info.crm_balance_state }); //返回审核字段的信息
                }
            }
            //adminRW充值操作
            if (info.isAdminRW()) {
                let adv_info = yield advertiser_1.findByPrimary(uuid); //crmuser信息
                yield users_ext_1.finduuid(adv_info.crmuuid); //找到相对应的余额表信息
                let user_ext_update_info = yield users_ext_1.modify_crm_balance_state(adv_info.crmuuid, [0, parseFloat(crm_balance_recharge) * 100, crm_points_recharge]); //更新审核总余额状态为0  : 表示经过adminRW审核
                return response_1.sendOK(res, { crm_balance_state: user_ext_update_info.crm_balance_state }); //返回审核字段的信息
            }
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//充值充错了，或者客户退款，用这个接口
exports.router.post("/cut/:uuid", logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { crm_balance, crm_points } = req.body;
        let uuid = req.params.uuid;
        const info = req.loginInfo;
        if (!info.isRoot()) //root only
            return response_1.sendNoPerm(res);
        crm_balance = crm_balance ? crm_balance : 0;
        crm_points = crm_points ? crm_points : 0;
        let adv_info = yield advertiser_1.findByPrimary(uuid); //crmuser信息
        yield users_ext_1.cut_crm_balance(adv_info.crmuuid, parseFloat(crm_balance) * 100); //更新总余额
        yield users_ext_1.cut_crm_total_balance(adv_info.crmuuid, parseFloat(crm_balance) * 100);
        yield users_ext_1.cut_crm_point(adv_info.crmuuid, crm_points);
        return response_1.sendOK(res, { msg: "扣减成功" });
    });
});
//审核后的广告商信息修改
exports.router.put('/normal_adv/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let uuid = req.params["uuid"]; //广告商的uuid
        let { contacts, phone } = req.body;
        let { zipcode, address, qq } = req.body;
        try {
            const info = req.loginInfo;
            if (!info.isAdvertiserRW()) //AdvertiserRW的权限才能执行之后的功能
                return response_1.sendNoPerm(res);
            let ads = yield advertiser_1.findByPrimary(uuid); //查找广告商
            //更新广告商
            ads.contacts = contacts, //联系人
                ads.phone = phone, //手机号
                ads.address = address, //地址
                ads.zipcode = zipcode, //编号
                ads.qq = qq; //邮箱
            yield advertiser_1.updateAdvertiser(ads, ads.uuid); //更新广告商信息
            return response_1.sendOK(res, ads);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//修改每日预算
exports.router.put('/dailybudget/modify/:uuid', logindao_1.checkLogin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let uuid = req.params.uuid;
        let { dailybudget } = req.body;
        try {
            const info = req.loginInfo;
            if (!info.isAdvertiserRW() && !info.isAdminRW() && !info.isRoot())
                return response_1.sendNoPerm(res);
            let advinfo = yield advertiser_1.findByPrimary(uuid);
            //更新每日预算
            advinfo.dailybudget = parseFloat(dailybudget);
            advinfo.tempdailybudget = 100;
            yield advertiser_1.updateAdvertiser(advinfo, advinfo.uuid); //更新广告商信息
            return response_1.sendOK(res, advinfo);
        }
        catch (e) {
            e.info(response_1.sendError, res, e);
        }
    });
});
//# sourceMappingURL=advertiser.js.map