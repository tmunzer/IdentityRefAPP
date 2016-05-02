var api = require(appRoot + "/bin/aerohive/api/req");


module.exports.GET = function (vpcUrl, accessToken, ownerID, callback) {
    var path = "/beta/configuration/ssids?ownerId="+ownerID;
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