var express = require('express');
var router = express.Router();
var API = require(appRoot + "/bin/aerohive/api/main");
/* GET users listing. */
router.post('/userGroup', function (req, res, next) {
    API.identity.userGroups(req.session.vpcUrl, req.session.accessToken, req.session.ownerID, null, null, function (err, result) {
        if (err) res.json(err);
        else res.json(result);
    });
});
router.post('/credentials', function (req, res, next) {
    var credentialType = [""];
    var userGroup = [""];
    var credentials = [];
    if (req.body.hasOwnProperty('credentialType') && req.body.credentialType.length>0) credentialType = req.body.credentialType;
    if (req.body.hasOwnProperty('userGroup') && req.body.userGroup.length>0) userGroup = req.body.userGroup;

    var reqDone = 0;
    var reqMax = credentialType.length * userGroup.length;
    credentialType.forEach(function (credential) {
        userGroup.forEach(function (group) {
            API.identity.credentials(req.session.vpcUrl, req.session.accessToken, req.session.ownerID, credential, group, null, null, null, null, null, null, null, null, null, null, function (err, result) {
                if (err) res.json(err);
                else {
                    console.log(result);
                    result.forEach(function (account) {
                        credentials.push(account);
                    });
                    reqDone++;
                }
                if (reqDone == reqMax) {
                    res.json(credentials);

                }
            });

        })
    });
});
module.exports = router;
