export const pgOpt = {
    database: "postgres",
    username: "postgres",
    password: "123456",
    options: {
        dialect: "postgres",
        //host: "192.168.0.210",
        host: "120.77.174.44",
        //host: "127.0.0.1",
        //port: 5432,
		port: 9997,
        timezone: "+8:00",
        pool: {
            maxConnections: 5,
            minConnections: 0,
            maxIdleTime: 100000
        }
    }
}