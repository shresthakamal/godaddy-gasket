#!/usr/bin/with-contenv sh
set -e

cd /home/app/hcs-express
# using the group that defined above, run npm start
exec s6-applyuidgid -u 9999 -g 999 npm start
