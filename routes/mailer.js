var express = require('express');
var router = express.Router();
var nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
var mailerConfig = require(appRoot + "/bin/mailer_config");

var transporter = nodemailer.createTransport(smtpTransport(mailerConfig.config));


transporter.verify(function(error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log('Connection to the SMTP server is Ok. I\'m ready to send your messages');
    }
});

router.post("/ios", function (req, res, next) {

    var userName, activeTime, ssid, password, destEmail;
    if (req.body.hasOwnProperty("userName")) userName = req.body.userName;
    if (req.body.hasOwnProperty("activeTime")) activeTime = req.body.activeTime;
    if (req.body.hasOwnProperty("ssid")) ssid = req.body.ssid;
    if (req.body.hasOwnProperty("password")) password = req.body.password;
    if (req.body.hasOwnProperty("destEmail")) destEmail = req.body.destEmail;
    else destEmail = userName;


    var mobileConfigContent =
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">' +
        '<plist version="1.0">' +
        '<dict>' +
        '<key>PayloadContent</key>' +
        '<array>' +
        '<dict>' +
        '<key>SSID_STR</key>' +
        '<string>' + ssid + '</string>' +
        '<key>HIDDEN_NETWORK</key>' +
        '<false/>' +
        '<key>AutoJoin</key>' +
        '<true/>' +
        '<key>EncryptionType</key>' +
        '<string>WPA2</string>' +
        '<key>IsHotspot</key>' +
        '<false/>' +
        '<key>Password</key>' +
        '<string>' + password + '</string>' +
        '<key>PayloadDescription</key>' +
        '<string>Configures Wi-Fi settings</string>' +
        '<key>PayloadDisplayName</key>' +
        '<string>WiFi</string>' +
        '<key>PayloadIdentifier</key>' +
        '<string>fr.ah-lab.identity.4855</string>' +
        '<key>PayloadType</key>' +
        '<string>com.apple.wifi.managed</string>' +
        '<key>PayloadUUID</key>' +
        '<string>C649D542-D680-4855-9CD5-917D373F256D</string>' +
        '<key>PayloadVersion</key>' +
        '<real>1</real>' +
        '<key>ProxyType</key>' +
        '<string>None</string>' +
        '</dict>' +
        '</array>' +
        '<key>PayloadVersion</key>' +
        '<integer>1</integer>' +
        '<key>PayloadDisplayName</key>' +
        '<string>Aerohive Wi-Fi Configuration</string>' +
        '<key>PayloadIdentifier</key>' +
        '<string>fr.ah-lab.identity</string>' +
        '<key>PayloadOrganization</key>' +
        '<string>Aerohive Networks</string>' +
        '<key>PayloadRemovalDisallowed</key>' +
        '<false/>' +
        '<key>PayloadType</key>' +
        '<string>Configuration</string>' +
        '<key>PayloadUUID</key>' +
        '<string>C649D542-D680-4855-9CD5-9174373F256D</string>' +
        '</dict>' +
        '</plist>';

    var mailOptions = {
        from: mailerConfig.from,
        to: destEmail,
        subject: mailerConfig.subject,
        text: mailerConfig.generateText(userName, ssid),
        attachments: [{'filename': 'WiFiProfile.mobileconfig', 'content': mobileConfigContent}]
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
        res.json({error: error, info: info});
    })
});


module.exports = router;