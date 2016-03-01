var apiRequest = require(appRoot + "/bin/aerohive/api/req").apiRequest;


module.exports = function (vpcUrl, accessToken, ownerID, credentialType, ownerId, memberOf, adUser, creator, loginName, firstName, lastName, phone, email, userGroup, page, pageSize, callback) {
    var path = "/xapi/v1/identity/credentials?ownerId=" + ownerID;
    if (credentialType) path += '&credentialType=' + credentialType;
    if (memberOf) path += '&memberOf=' + memberOf;
    if (adUser) path += '&adUser=' + adUser;
    if (creator) path += '&creator=' + creator;
    if (loginName) path += '&loginName=' + loginName;
    if (firstName) path += '&firstName=' + firstName;
    if (lastName) path += '&lastName=' + lastName;
    if (phone) path += '&phone=' + phone;
    if (email) path += '&email=' + email;
    if (userGroup) path += '&userGroup=' + userGroup;
    if (page) path += '&page=' + page;
    if (pageSize) path += '&pageSize=' + pageSize;
    apiRequest(vpcUrl, accessToken, path, function (err, result) {
        if (err) {
            callback(err, null);
        } else if (result) {
            callback(null, result);
        } else {
            callback(null, null);
        }
    })
};