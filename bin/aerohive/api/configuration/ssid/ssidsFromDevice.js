var api = require(appRoot + "/bin/aerohive/api/req");


module.exports.GET = function (vpcUrl, accessToken, ownerID, deviceId, callback) {
    var path = "/beta/configuration/devices/" + deviceId + "/ssids?ownerId="+ownerID;
    api.GET(vpcUrl, accessToken, path, function (err, result) {
        if (err){
            callback(err, null);
        } else if (result){
            callback(null, result);
        } else {
            callback(null, null);
        }
    })
};

module.exports.PUT = function (vpcUrl, accessToken, ownerID, deviceId, changes, callback) {
    var path = "/beta/configuration/devices/" + deviceId + "/ssids?ownerId="+ownerID;
    api.PUT(vpcUrl, accessToken, path, changes, function (err, result) {
        if (err){
            callback(err, null);
        } else if (result){
            callback(null, result);
        } else {
            callback(null, null);
        }
    })
};