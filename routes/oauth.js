var express = require('express');
var router = express.Router();
var OAuth = require("../bin/aerohive/api/oauth");
var devApp = require("../config").aerohiveApp;
var Error = require('../routes/error');

router.get('/reg', function (req, res) {
    if (req.query.hasOwnProperty('error')) {
        Error.render(req.query.error, "conf", req, res);
    } else if (req.query.hasOwnProperty("authCode")) {
        var authCode = req.query.authCode;
        OAuth.getPermanentToken(authCode, devApp.redirectUrl, devApp.clientSecret, devApp.clientID, function(data){
            if (data.hasOwnProperty("error")) Error.render(data.error, "conf", req, res);
            else if (data.hasOwnProperty("data")) {
                for (var owner in data.data) {
                    req.session.xapi = {
                        rejectUnauthorized: true,
                        vpcUrl: data.data[owner].vpcUrl.replace("https://", ""),
                        ownerId: data.data[owner].ownerId,
                        accessToken: data.data[owner].accessToken,
                        hmngType: "public"
                    };

                }
                console.log(req.session);
                res.redirect('/web-app/');
            }
        });
    } else Error.render("Unknown error", "conf", req, res);
});

module.exports = router;