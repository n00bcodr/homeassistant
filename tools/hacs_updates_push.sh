#!/bin/bash
cd /config
#git config core.sshCommand 'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -i /config/.ssh/id_rsa -F /dev/null'
git add custom_components/ www/community/ -f
git commit -m "➕➖ HACS files"
git status
git push -u origin master
exit
