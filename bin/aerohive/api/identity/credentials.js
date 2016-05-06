var api = require(appRoot + "/bin/aerohive/api/req");


module.exports.getCredentials = function (vpcUrl, accessToken, ownerID, credentialType, userGroup, memberOf, adUser, creator, loginName, firstName, lastName, phone, email, page, pageSize, callback) {
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

module.exports.createCredential = function (vpcUrl, accessToken, ownerID, memberOf, adUser, hmCredentialsRequestVo, callback) {
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

module.exports.deleteCredential = function (vpcUrl, accessToken, ownerID, memberOf, adUser, ids, callback) {
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

module.exports.deliverCredential = function (vpcUrl, accessToken, ownerID, memberOf, adUser, hmCredentialDeliveryInfoVo, callback) {
    var path = "/v1/identity/credentials/deliver?ownerId=" + ownerID;
    if (memberOf && memberOf!="") path += '&memberOf=' + memberOf;
    if (adUser && adUser!="") path += '&adUser=' + adUser;

    for (var key in hmCredentialDeliveryInfoVo) {
        if (hmCredentialDeliveryInfoVo[key] === '') delete hmCredentialDeliveryInfoVo[key];
    }
    api.POST(vpcUrl, accessToken, path, hmCredentialDeliveryInfoVo, function (err, result) {
        if (err) {
            callback(err, null);
        } else if (result) {
            callback(null, result);
        } else {
            callback(null, null);
        }
    })
};

module.exports.renewCredential = function (vpcUrl, accessToken, ownerID, credentialId, memberOf, adUser, callback) {
    var path ="/v1/identity/credentials/" + credentialId + "/renew?ownerId=" + ownerID;
    if (memberOf && memberOf!="") path += '&memberOf=' + memberOf;
    if (adUser && adUser!="") path += '&adUser=' + adUser;
    api.PUT(vpcUrl, accessToken, path, function(err, result){
        if (err) {
            callback(err, null);
        } else if (result) {
            callback(null, result);
        } else {
            callback(null, null);
        }
    })
};

module.exports.updateCredential = function (vpcUrl, accessToken, ownerID, credentialId, memberOf, adUser, hmCredentialUpdateVo, callback) {
    var path ="/v1/identity/credentials/" + credentialId + "?ownerId=" + ownerID;
    if (memberOf && memberOf!="") path += '&memberOf=' + memberOf;
    if (adUser && adUser!="") path += '&adUser=' + adUser;

    for (var key in hmCredentialUpdateVo) {
        if (hmCredentialUpdateVo[key] === '') delete hmCredentialUpdateVo[key];
    }
    api.PUT(vpcUrl, accessToken, path, hmCredentialUpdateVo, function (err, result) {
        if (err) {
            callback(err, null);
        } else if (result) {
            callback(null, result);
        } else {
            callback(null, null);
        }
    })
};