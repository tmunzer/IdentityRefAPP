var express = require('express');
var router = express.Router();
var API = require(appRoot + "/bin/aerohive/api/main");
/* GET users listing. */
router.get('/userGroup', function(req, res, next) {
    API.identity.userGroups(req.session.vpcUrl, req.session.accessToken, req.session.ownerID, null, null, function(err, result){
        if (err) res.json(err);
        else res.json(result);
    });
});
router.get('/credentials', function(req, res, next) {
    API.identity.credentials(req.session.vpcUrl, req.session.accessToken, req.session.ownerID, null, null,  null, null, null, null, null, null, null, null, null, null, null, function(err, result){
        if (err) res.json(err);
        else res.json(result);
    });
});
module.exports = router;
