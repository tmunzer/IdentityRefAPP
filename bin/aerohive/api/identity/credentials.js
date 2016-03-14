var api = require(appRoot + "/bin/aerohive/api/req");


module.exports.GET = function (vpcUrl, accessToken, ownerID, credentialType, userGroup, memberOf, adUser, creator, loginName, firstName, lastName, phone, email, page, pageSize, callback) {
    var path = "/xapi/v1/identity/credentials?ownerId=" + ownerID;
    if (credentialType && credentialType!="") path += '&credentialType=' + credentialType;
    if (memberOf && memberOf!="") path += '&memberOf=' + memberOf;
    if (adUser && adUser!="") path += '&adUser=' + adUser;
    if (creator && creator!="") path += '&creator=' + creator;
    if (loginName && loginName!="") path += '&loginName=' + loginName;
    if (firstName && firstName!="") path += '&firstName=' + firstName;
    if (lastName && lastName!="") path += '&lastName=' + lastName;
    if (phone && phone!="") path += '&phone=' + phone;
    if (email && email!="") path += '&email=' + email;
    if (userGroup && userGroup!="") path += '&userGroup=' + userGroup;
    if (page && page!="") path += '&page=' + page;
    if (pageSize && pageSize!="") path += '&pageSize=' + pageSize;
    api.GET(vpcUrl, accessToken, path, function (err, result) {
        if (err) {
            callback(err, null);
        } else if (result) {
            callback(null, result);
        } else {
            callback(null, null);
        }
    })
};

module.exports.POST = function (vpcUrl, accessToken, ownerID, memberOf, adUser, hmCredentialsRequestVo, callback) {
    var path = "/xapi/v1/identity/credentials?ownerId=" + ownerID;
    if (memberOf && memberOf!="") path += '&memberOf=' + memberOf;
    if (adUser && adUser!="") path += '&adUser=' + adUser;

    for (var key in hmCredentialsRequestVo) {
        if (hmCredentialsRequestVo[key] === '') delete hmCredentialsRequestVo[key];
    }
    api.POST(vpcUrl, accessToken, path, hmCredentialsRequestVo, function (err, result) {
        if (err) {
            callback(err, null);
        } else if (result) {
            callback(null, result);
        } else {
            callback(null, null);
        }
    })
};

module.exports.DELETE = function (vpcUrl, accessToken, ownerID, memberOf, adUser, ids, callback) {
    var path = "/xapi/v1/identity/credentials?ownerId=" + ownerID;
    if (memberOf && memberOf!="") path += '&memberOf=' + memberOf;
    if (adUser && adUser!="") path += '&adUser=' + adUser;
    if (ids && ids != "") path += '&ids=' + ids;
    api.DELETE(vpcUrl, accessToken, path, function (err, result) {
        if (err) {
            callback(err, null);
        } else if (result) {
            callback(null, result);
        } else {
            callback(null, null);
        }
    })
};