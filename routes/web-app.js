var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    if (req.session.xapi) {
        res.render('web-app', {
            title: 'Identity',
            server: req.session.xapi.vpcUrl,
            ownerId: req.session.xapi.ownerId,
            accessToken: req.session.xapi.accessToken,
            hmngType: req.session.xapi.hmngType
        });
    } else res.redirect("/");
});
module.exports = router;
