var express = require('express');
var router = express.Router();
var OAuth = require(appRoot + "/bin/aerohive/api/oauth");
var ApiConf = require(appRoot + "/bin/aerohive/config");

router.get('/reg', function (req, res) {
    if (req.query.hasOwnProperty('error')) {
        console.log("1");
        Error.render(req.query.error, "conf", req, res);
    } else if (req.query.hasOwnProperty("authCode")) {
        console.log("2");
        var authCode = req.query.authCode;
        OAuth.getPermanentToken(authCode, ApiConf.redirectUrl, ApiConf.secret, ApiConf.clientId, function(res){
            console.log(res);
        });
    } else console.log("3");
});

module.exports = router;