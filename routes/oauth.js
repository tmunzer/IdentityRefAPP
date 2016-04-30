var express = require('express');
var router = express.Router();
var OAuth = require(appRoot + "/bin/aerohive/api/oauth");
var ApiConf = require(appRoot + "/bin/aerohive/config");
var Error = require(appRoot + '/routes/error');

router.get('/reg', function (req, res) {
    if (req.query.hasOwnProperty('error')) {
        Error.render(req.query.error, "conf", req, res);
    } else if (req.query.hasOwnProperty("authCode")) {
        var authCode = req.query.authCode;
        OAuth.getPermanentToken(authCode, ApiConf.redirectUrl, ApiConf.secret, ApiConf.clientId, function(data){
            if (data.hasOwnProperty("error")) Error.render(data.error, "conf", req, res);
            else if (data.hasOwnProperty("data")) {
                console.log(data);
                console.log(typeof data);
                console.log(data.data);
                console.log(typeof data.data);
                data.data.forEach(function (owner) {
                    req.session.ownerId = owner.ownerId;
                    req.session.vpcUrl = owner.vpcUrl;
                    req.session.accessToken = owner.accessToken;
                });
                res.redirect('/web-app/');
            }
        });
    } else Error.render("Unknown error", "conf", req, res);
});

module.exports = router;