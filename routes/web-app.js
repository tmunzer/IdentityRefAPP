var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    if (req.session.vpcUrl && req.session.ownerID && req.session.accessToken) {
        res.render('web-app', {
            title: 'Identity',
            server: req.session.vpcUrl,
            ownerId: req.session.ownerID,
            accessToken: req.session.accessToken
        });
    } else res.redirect("/");
});
module.exports = router;
