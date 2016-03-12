var api = require(appRoot + "/bin/aerohive/api/req");
var Device = require(appRoot + "/bin/aerohive/models/device.js");


module.exports.GET = function (vpcUrl, accessToken, ownerId, callback) {

    var path = '/xapi/v1/monitor/devices?ownerId=' + ownerId;

    // send the API request
    api.GET(vpcUrl, accessToken, path, function (err, result) {
        if (err){
            callback(err, result);
        }
        else if (result){
            var devicesFromAPI = result;
            var deviceList = [];

            // for each device.js from the API response
            for (var i = 0; i < devicesFromAPI.length; i++) {
                deviceList.push(new Device(devicesFromAPI[i]));
            }
            callback(null, deviceList);
        } else {
            callback(null, []);
        }

    })
};