module.exports.config = {
    host: 'smtp.example.com',
    port: 587,
    secureConnection: false, // TLS requires secureConnection to be false
    //    ignoreTLS: false,
    tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: true
    },
    auth: {
        user: 'user@example.com',
        pass: 'password'
    }
};

module.exports.from = '"identity Ref App" <no-reply@ah-lab.fr>';

module.exports.subject = "Wi-Fi Configuration for iOS devices";

module.exports.generateText = function(userName, ssid){
    return "Hi " + userName + ",\n\r\n\rHere is your auto-configuration profile to get access to my Guest Network \""+ssid+"\".\r\n" +
        "You just have to install the configuration profile enclosed to this email to automatically configure your device.\r\n" +
        "Be sure to activate Wi-Fi on your device" +
        "\r\n" +
        "\r\n" +
        "Thanks!";
};
