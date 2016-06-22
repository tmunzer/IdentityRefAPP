# identity

[![GitHub version](https://badge.fury.io/gh/tmunzer%2Fidentity.svg)](https://badge.fury.io/gh/tmunzer%2Fidentity)


#Notice
This is a Free web app built to work with Aerohive APIs. This app is designed to provide a user friendly interface to manage/create/remove/renew PPSK or login/pwd account stored on HiveManager NG (Cloud or OnPremise)

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

#Installation
##First Run
To run this App, you need NodeJS and NodeJS packages:

1. Download and Install [NodeJS](https://nodejs.org/en/). This application was developped and tested with NodeJS 4.3.0
2. From the project root folder, run 
    * `npm install`
    * `bower install`
3. Configure the app with your [Aerohive Developer information](https://developer.aerohive.com/):
    - Copy/Paste the file `root_folder/bin/aerohive/config_example` to `root_folder/bin/aerohive/config`
    - Edit the file `root_folder/bin/aerohive/config` to match your developer information (Client ID, secret ID and redirect URL)

    By default, the redirectUrl should be     `https://<server_IP_Address_or_FQDN>/oauth/reg`
    
4. Once done, you can start the APP. Go to `root_folder/bin/`and execute "www". If `node`is not in your $PATH, you may have to start the server from a terminal: `path_to_node/node ./bin/www`
5. Go to http://<server_IP_Address_or_FQDN>:3000/

##Enable HTTPS
By default, this App is configured to only enable HTTP access. To enable HTTPS, you have several solutions, like:
* edit the file `root_folder/bin/www` to add HTTPS support. You will be able to find some help on the [NodeJS help](https://nodejs.org/api/https.html)
* use a web server like Apache or Nginx as a reverse proxy, and deal with HTTPS on this web server. By doing this, you will be able to deploy many web applicaiton on the same server and present a specific SSL certificate for each virtual host.
