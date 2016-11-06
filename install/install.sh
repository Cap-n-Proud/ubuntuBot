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
sudo cp bot-Server /etc/init.d/bot-Server
sudo chmod 0755 /etc/init.d/bot-Server
sudo update-rc.d bot-Server defaults

mkdir /home/$USER/Documents
sudo chmod 0755 /home/$USER/Documents

mkdir /home/$USER/Documents/bot
sudo chmod 0755 /home/$USER/Documents/bot

mkdir /home/$USER/Documents/log/
sudo chmod 0755 /home/$USER/Documents/log/


cd /home/$USER/ubuntuBot/server/app
npm install

exit 0
