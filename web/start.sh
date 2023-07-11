# start the lighttpd web server in the background
lighttpd -f /etc/lighttpd/lighttpd.conf

# run redis server in the background
redis-server /etc/redis/redis.conf

# populate redis server
redis-cli < /redis.start
rm /redis.start

# sleep
sleep infinity