#!/bin/bash

# to download the latest repository: 
#git clone https://github.com/pfnegrini/bot-Pi.git /home/pi/bot-Pi

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

echo -n "Want to confgure RaspberryPi? [Y/N]"
read BUILDUP


if [ "$BUILDUP" == "Y" ]
then
  git clone https://github.com/pfnegrini/BuildUP.git /home/pi/BuildUP
  sudo bash /home/pi/BuildUP/RPi-init.sh
fi

echo -e "***** Setting up  bot-Pi server *****"
sudo cp bot-PiServer /etc/init.d/bot-PiServer
sudo chmod 0755 /etc/init.d/bot-PiServer
sudo update-rc.d bot-PiServer defaults

mkdir /home/pi/Documents
sudo chmod 0755 /home/pi/Documents

mkdir /home/pi/Documents/bot-Pi
sudo chmod 0755 /home/pi/Documents/bot-Pi

mkdir /home/pi/Documents/log/
sudo chmod 0755 /home/pi/Documents/log/


cd /home/pi/bot-Pi/server/app
npm install

exit 0
