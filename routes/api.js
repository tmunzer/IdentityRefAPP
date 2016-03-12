var express = require('express');
var router = express.Router();
var API = require(appRoot + "/bin/aerohive/api/main");
/* GET users listing. */
router.post('/identity/userGroup', function (req, res, next) {
    API.identity.userGroups.GET(req.session.vpcUrl, req.session.accessToken, req.session.ownerID, null, null, function (err, result) {
        if (err) res.json({error: err});
        else res.json(result);
    });
});
router.get('/identity/credentials', function (req, res, next) {
    var credentialType = [""];
    var userGroup = [""];
    var credentials = [];

    if (req.query.hasOwnProperty('credentialType') && req.query.credentialType.length>0) credentialType = req.query.credentialType;
    if (req.query.hasOwnProperty('userGroup') && req.query.userGroup.length>0) userGroup = req.query.userGroup;

    var reqDone = 0;
    var reqMax = credentialType.length * userGroup.length;
    credentialType.forEach(function (credential) {
        userGroup.forEach(function (group) {
            API.identity.credentials.GET(req.session.vpcUrl, req.session.accessToken, req.session.ownerID, credential, group, null, null, null, null, null, null, null, null, null, null, function (err, result) {
                if (err) res.json({error: err});
                else {
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
router.post('/identity/credentials', function (req, res, next) {
    var hmCredentialsRequestVo = {};
    if (req.body.hasOwnProperty('hmCredentialsRequestVo')) hmCredentialsRequestVo = req.body.hmCredentialsRequestVo;
    API.identity.credentials.POST(req.session.vpcUrl, req.session.accessToken, req.session.ownerID, null, null, hmCredentialsRequestVo, function(err, result){
        if (err) res.json({error: err});
        else res.json(result);
    })
});
module.exports = router;
