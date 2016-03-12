var api = require(appRoot + "/bin/aerohive/api/req");
var Location = require(appRoot + "/bin/aerohive/models/location");


module.exports.GET = function (vpcUrl, accessToken, ownerID, callback) {
    var path = "/xapi/v1/configuration/apLocationFolders?ownerId="+ownerID;
    api.GET(vpcUrl, accessToken, path, function (err, result) {
        if (err){
            callback(err, null);
        } else if (result){
            var location = new Location(result);
            callback(null, location);
        } else {
            callback(null, null);
        }
    })
};