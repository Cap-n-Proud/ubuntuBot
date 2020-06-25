#!/bin/bash

asd() {
cat <<"EOT"




                         .^.
                         /   \
                        /     \
                *******/       \*******
           ***** *****/         \***** *****
       ***** ********/           \******** *****
      *** **********/             \********** ***
       ***** ******/               \****** *****
           ***** */        _**_     \* *****
                */      _-******\    \*
                /    _-" *****   "\   \
                \__-"              "\_/



EOT
}

asd


echo -e "***** Setting up  bot server *****"
sudo apt full-upgrade -y
sudo apt-get purge wolfram-engine
sudo apt-get purge libreoffice*
sudo apt-get clean
sudo apt-get autoremove
sudo apt-get install -y nano git wget nodejs tightvncserver xrdp cmake libtiff-dev 
sudo cp bot-Server /etc/init.d/bot-Server
sudo chmod 0755 /etc/init.d/bot-Server
sudo update-rc.d bot-Server defaults
#curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -

mkdir /home/$USER/Documents
sudo chmod 0755 /home/$USER/Documents

mkdir /home/$USER/Documents/bot
sudo chmod 0755 /home/$USER/Documents/bot

mkdir /home/$USER/Documents/log/
sudo chmod 0755 /home/$USER/Documents/log/


cd /home/$USER/ubuntuBot/server/app
npm install

exit 0
