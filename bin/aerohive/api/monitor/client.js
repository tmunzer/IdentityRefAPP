var api = require(appRoot + "/bin/aerohive/api/req");


module.exports.GET = function (vpcUrl, accessToken, ownerId, callback) {

    var path = '/xapi/v1/monitor/clients?ownerId=' + ownerId;

    // send the API request
    api.GET(vpcUrl, accessToken, path, function (err, result) {
        if (err){
            callback(err, result);
        }
        else if (result){
            callback(null, result);
        } else {
            callback(null, []);
        }

    })
};