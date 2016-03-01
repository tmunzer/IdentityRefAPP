var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    if (req.session.vpcUrl && req.session.ownerID && req.session.accessToken) {
        res.render('web-app', {title: 'Identity'});
    } else res.redirect("/");
});
module.exports = router;
