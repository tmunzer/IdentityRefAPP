var api = require(appRoot + "/bin/aerohive/api/req");


module.exports.GET = function (vpcUrl, accessToken, ownerID, folderId, callback) {
    var path = "/xapi/v1/configuration/apLocationFolders?ownerId="+ownerID;
    if (folderId) path += "folderId=" + folderId;
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