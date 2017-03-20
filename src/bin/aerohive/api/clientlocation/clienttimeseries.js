var api = require("../req");


module.exports.GET = function (xapi, location, startTime, endTime, timeUnit, callback) {
    var path = "/xapi/v1/clientlocation/clienttimeseries?" +
        "ownerId=" + xapi.ownerId +
        "&location=" + location +
        "&startTime=" + startTime +
        "&endTime=" + endTime +
        "&timeUnit=" + timeUnit;
    api.GET(xapi, path, function (err, result) {
        if (err){
            callback(err, null);
        } else if (result){
            callback(null, result);
        } else {
            callback(null, null);
        }
    })
};

