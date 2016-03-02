var apiRequest = require(appRoot + "/bin/aerohive/api/req").apiRequest;


module.exports = function (vpcUrl, accessToken, ownerID, credentialType, userGroup, memberOf, adUser, creator, loginName, firstName, lastName, phone, email, page, pageSize, callback) {
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