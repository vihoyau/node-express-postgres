import { DataTypes, Sequelize } from "sequelize"
import { getModel } from "../../../lib/global"
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
        username: DataTypes.CHAR(16),//用户手机号
        password: DataTypes.CHAR(64),//加密密码
        nickname: DataTypes.CHAR(16),//昵称
        nicknamenumber: DataTypes.INTEGER,//修改昵称数
        openid: DataTypes.CHAR(64),//微信授权
        qqcode: DataTypes.CHAR(64),//qq授权
        invitationcode: DataTypes.CHAR(16),//邀请码
        gender: DataTypes.CHAR(16),//性别
        age: DataTypes.CHAR(16),//年龄段
        birth: DataTypes.TIME,//生日
        income: DataTypes.INTEGER,//收入
        job: DataTypes.CHAR(32),//职业
        interest: DataTypes.JSONB,//兴趣
        label: DataTypes.JSONB,//标签
        imageurl: DataTypes.CHAR(128),//头像路径
        idcardurl:DataTypes.CHAR(128),//身份证路径
        historypoints:DataTypes.INTEGER,//历史积分
        points: DataTypes.INTEGER,//当前积分
        historycash: DataTypes.FLOAT,//历史现金
        cash: DataTypes.FLOAT,//当前现金
        inviteuncash: DataTypes.FLOAT,//被邀请应得金额
        invitecash: DataTypes.FLOAT,//邀请到账金额
        legitimatestate: DataTypes.ENUM("legitimate", "illegal","exception"),//非法合法异常
        mode: DataTypes.ENUM("qrcode", "wechat","qq","app"),//注册入口方式
        cashstate: DataTypes.ENUM("off", "on"),//一元资格提现状态
        activation: DataTypes.ENUM("off", "on"),//被邀请激活状态
        pem: DataTypes.ENUM("personuser", "business","administrator","root"),//权限，个人，商家，管理员，平台
        pemclassification:DataTypes.UUID,//权限用户组分类uuid
        invitemember: DataTypes.INTEGER,//邀请人数
        loginnumber: DataTypes.INTEGER,//登录次数
        withdrawnumber: DataTypes.INTEGER,//提现次数
        newstate: DataTypes.ENUM("off", "on"),//新人状态
        created: DataTypes.TIME,
        modified: DataTypes.TIME,
        
    }, {
            timestamps: false,
            schema: schema,
            freezeTableName: true,
            tableName: table,
        })
}
//插入一条用户记录
export async function insertUser(obj: any) {
    let res = await getModel(modelName).create(obj)
    return res.get()
}



//通过邀请码code查询用户是否异常 qiuweihao 06-25
export async function updateExceptionUser(invitationcode:string,legitimatestate:string) {      
    await getModel(modelName).update({legitimatestate }, { where: { invitationcode } }) 
}

//通过邀请码code查询用户是否异常 qiuweihao 06-25
//通过查询属性返回结果
export async function selectUser(param:string) {      
    let res = await getModel(modelName).findOne({ where: { param} });
    return res ? res.get() : undefined ;      
}