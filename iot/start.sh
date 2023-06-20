# command that will run server if not running
while true; do (
    ps -aux | grep 'qemu-mips /usr/sbin/lighttpd' | grep -v grep || qemu-mips /usr/sbin/lighttpd -f /etc/lighttpd/lighttpd.conf; 
    stat /tmp/api.socket-0 || (kill -9 $(ps -aux | grep -v grep | grep 'qemu-mips /usr/sbin/lighttpd' | awk '{print $2}'); qemu-mips /usr/sbin/lighttpd -f /etc/lighttpd/lighttpd.conf); 
    sleep 4;
); done