# start the lighttpd web server in the background
lighttpd -f /etc/lighttpd/lighttpd.conf

# run redis server in the background
redis-server /etc/redis/redis.conf

# populate redis server
redis-cli < /redis.start
rm /redis.start

# sleep
while true; do (
    ps -aux | grep 'lighttpd -f /etc/lighttpd/lighttpd.conf' | grep -v grep || lighttpd -f /etc/lighttpd/lighttpd.conf;
    sleep 4;
); done