

module.exports.configuration = {
    location: {
        GET: require(appRoot + "/bin/aerohive/api/configuration/location").GET
    }
};

module.exports.monitor = {
    device: {
        GET: require(appRoot + "/bin/aerohive/api/monitor/device").GET
    }
};

module.exports.clientlocation = {
    clienttimeseries: {
        GET: require(appRoot + "/bin/aerohive/api/clientlocation/clienttimeseries").GET,
        GETwithEE: require(appRoot + "/bin/aerohive/api/clientlocation/clienttimeseries").GETwithEE

    },
    clientcount: {
        GET: require(appRoot + "/bin/aerohive/api/clientlocation/clientcount").GET,
        GETwithEE: require(appRoot + "/bin/aerohive/api/clientlocation/clientcount").GETwithEE
    }
};

module.exports.identity = {
    userGroups: {
        GET: require(appRoot + "/bin/aerohive/api/identity/userGroups").GET
    },
    credentials: {
        GET: require(appRoot + "/bin/aerohive/api/identity/credentials").GET,
        POST: require(appRoot + "/bin/aerohive/api/identity/credentials").POST,
        DELETE: require(appRoot + "/bin/aerohive/api/identity/credentials").DELETE
    }
};