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
const global_1 = require("../../lib/global");
const sequelize_1 = require("sequelize");
const system_1 = require("../../model/system/system");
const [schema, table] = ["users", "lotteryrulesrecord"];
const modelName = `${schema}.${table}`;
exports.defineFunction = function (sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        lotteryrule: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.JSONB),
        awarduuid: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.JSONB),
        eventname: sequelize_1.DataTypes.TEXT,
        created: sequelize_1.DataTypes.TIME
    }, {
        timestamps: false,
        schema: schema,
        freezeTableName: true,
        tableName: table,
    });
};
//创建抽奖规则的历史记录表
function create_one_lotteryrulesrecord(lotteryrulesrecord) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(lotteryrulesrecord);
        let res = yield global_1.getModel(modelName).create(lotteryrulesrecord, { returning: true });
        return res ? res.get() : undefined;
    });
}
exports.create_one_lotteryrulesrecord = create_one_lotteryrulesrecord;
//查看users.lotteryrulesrecord表的单个记录
function find_one_lotteryrulesrecord(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(uuid);
        //   let res = await getModel(modelName).findAll({ where: { uuid: uuid } }) as any[]
        //return res ? res.map(r => r.get()) : undefined
        let res = yield global_1.getModel(modelName).findOne({ where: { uuid: uuid } });
        return res ? res.get() : undefined;
    });
}
exports.find_one_lotteryrulesrecord = find_one_lotteryrulesrecord;
function gelotteryrulesrecordList(sequelize) {
    return __awaiter(this, void 0, void 0, function* () {
        //获取抽奖开关按钮关闭前的抽奖设置记录
        let res = yield sequelize.query(`SELECT
 up.content 
 FROM
 system.system AS up
 where
 up.name = 'eventname'
 or  up.name='lotteryrules'
 or  up.name = 'lotterycondition'
 or  up.name = 'timerange'
 or  up.name = 'numcondition'
 or  up.name = 'possibility'
`, { type: "select" });
        console.log(res);
        return res;
    });
}
exports.gelotteryrulesrecordList = gelotteryrulesrecordList;
function getlotteryuserprizeList(sequelize) {
    return __awaiter(this, void 0, void 0, function* () {
        let event = yield system_1.findByName('eventname'); //获得当前的活动名称记录
        let eventstate = event.content.event; //获取活动名称
        /*    let time = await findByName('timerange')
           let starttime = time.content.starttime     //获取活动开始时间
           let endtime   = time.content.endtime       //获取活动结束时间 */
        //获取抽奖开关按钮关闭前的抽奖记录的uuid （通过时间和活动判断）
        let res = yield sequelize.query(`SELECT
 up.uuid 
 FROM
 users.userprize AS up
 where
  up.eventname = '${eventstate}'
`, { type: "select" });
        console.log(res);
        return res;
    });
}
exports.getlotteryuserprizeList = getlotteryuserprizeList;
/**
 * 获得活动的所有记录数
 */
function get_event_Count(sequelize, searchdata) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`SELECT
count(*)
FROM
users.lotteryrulesrecord AS up
WHERE
up.eventname like '%${searchdata}%'
`, { type: "select" });
        return res[0].count;
    });
}
exports.get_event_Count = get_event_Count;
//获取单个活动记录数
function get_one_event_Count(sequelize, searchdata, state, lotterytype, receive, eventname) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`SELECT
count(*)
FROM
users.userprize AS up
LEFT JOIN mall.prize AS p ON up.prizeuuid = p.uuid
WHERE
  up.eventname = '${eventname}'
and  p.state like '%${state}%'
  and  up.state like '%${receive}%'
  and up.lotterytype like '%${lotterytype}%'
and(
up.username LIKE '%${searchdata}%'
OR p.title LIKE '%${searchdata}%'
)
`, { type: "select" });
        return res[0].count;
    });
}
exports.get_one_event_Count = get_one_event_Count;
/**
 * 通过users.userprize的uuid获得活动获奖历史记录列表
 */
function getevent_prizeList(sequelize, cursor, limit, searchdata) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`SELECT
up.uuid,
  up.eventname,
  up.lotteryrule,
  up.awarduuid
FROM
users.lotteryrulesrecord AS up
WHERE
up.eventname like '%${searchdata}%'
ORDER BY
up.created DESC
  OFFSET ${cursor}
LIMIT ${limit}`, { type: "select" });
        return res;
    });
}
exports.getevent_prizeList = getevent_prizeList;
/**
 * 获得某个获奖用户列表
 */
function getlotterytUserprizeList(sequelize, searchdata, state, lotterytype, receive, eventname, cursor, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield sequelize.query(`SELECT
up.uuid,
  up.username,
  up.level,
  up.state as receive,
  up.created,
  up.lotterytype,
  up.eventname,
  p.title,
  p.state
FROM
users.userprize AS up
LEFT JOIN mall.prize AS p ON up.prizeuuid = p.uuid
WHERE
 up.eventname = '${eventname}'
 and p.state like '%${state}%'
 and  up.state like '%${receive}%'
 and up.lotterytype like '%${lotterytype}%'
 and(
 up.username LIKE '%${searchdata}%'
 OR p.title LIKE '%${searchdata}%'
 ) 
 ORDER BY
 up."username" ASC,
 up."level" ASC,
 up."created" DESC
 OFFSET ${cursor}
 LIMIT ${limit}
`, { type: "select" });
        return res;
    });
}
exports.getlotterytUserprizeList = getlotterytUserprizeList;
/**
 * 获得某活动奖品列表记录数
 */
/* export async function getCount(sequelize: Sequelize, searchdata: string, state: string, lotterytype: string, receive: string) {
  let res = await sequelize.query(`SELECT
count(*)
FROM
users.userprize AS up
LEFT JOIN mall.prize AS P ON up.prizeuuid = P .uuid
WHERE
p.state like '%${state}%'
  and  up.state like '%${receive}%'
  and up.lotterytype like '%${lotterytype}%'
  and up.uuid like
and(
up.username LIKE '%${searchdata}%'
OR P .title LIKE '%${searchdata}%'
)
`, { type: "select" }) as any[]
  return res[0].count
} */
//# sourceMappingURL=lotteryrulesrecord.js.map