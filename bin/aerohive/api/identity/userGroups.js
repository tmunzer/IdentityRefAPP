var api = require(appRoot + "/bin/aerohive/api/req");


module.exports.getUserGroups = function (vpcUrl, accessToken, ownerID, memberOf, adUser, callback) {
    var path = "/xapi/v1/identity/userGroups?ownerId="+ownerID;
    if (memberOf) path += '&memberOf=' + memberOf;
    if (adUser) path += '&adUser=' + adUser;
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