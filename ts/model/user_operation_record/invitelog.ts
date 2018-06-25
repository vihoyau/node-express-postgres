
import { DataTypes, Sequelize } from "sequelize"
import { getModel } from "../../lib/global"
const [schema, table] = ["users", "userinfo"]
const modelName = `${schema}.${table}`
/**
 * 用户注册模块
 * qiuweihao  
 * 2018.06.25
 */
export const defineFunction = function (sequelize: Sequelize) {
    return sequelize.define(modelName, {
        uuid: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        useruuid: DataTypes.UUID,//邀请人uuid
        inviteduuid: DataTypes.FLOAT,//被邀请人uuid
        invitedawardcash: DataTypes.FLOAT,//被邀请人奖励
        userawardcash:DataTypes.FLOAT,//邀请人获取奖励金额
        invitedawardpoints: DataTypes.INTEGER,//被邀请人获取奖励积分
        userawardpoints: DataTypes.INTEGER,//邀请人获取奖励积分
        state: DataTypes.CHAR(16),// 判断是否到账，默认off，on
        created: DataTypes.TIME,
        modified: DataTypes.TIME
    }, {
            timestamps: false,
            schema: schema,
            freezeTableName: true,
            tableName: table,
        })
}
//插入一条用户记录
export async function insertInviteLog(obj: any) {
    let res = await getModel(modelName).create(obj)
    return res.get()
}
