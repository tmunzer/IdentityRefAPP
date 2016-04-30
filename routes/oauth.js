var express = require('express');
var router = express.Router();
var OAuth = require(appRoot + "/bin/aerohive/api/oauth");
var ApiConf = require(appRoot + "/bin/aerohive/config");
var Error = require(appRoot + '/routes/error');

router.get('/reg', function (req, res) {
    if (req.query.hasOwnProperty('error')) {
        console.log("1");
        Error.render(req.query.error, "conf", req, res);
    } else if (req.query.hasOwnProperty("authCode")) {
        console.log("2");
        var authCode = req.query.authCode;
        OAuth.getPermanentToken(authCode, ApiConf.redirectUrl, ApiConf.secret, ApiConf.clientId, function(data){
            console.log(data.error);
            console.log(typeof data);
            if (data.hasOwnProperty("error")) Error.render(data.error, "conf", req, res);

        });
    } else console.log("3");
});

module.exports = router;