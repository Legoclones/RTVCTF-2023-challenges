FROM ubuntu:22.04

# install dependencies
RUN apt update && apt upgrade -y && apt dist-upgrade -y
RUN apt install -y qemu qemu-user qemu-user-static 'binfmt*' lighttpd lua5.4 curl netcat

# copy files
COPY www/ /www/
COPY lighttpd /etc/lighttpd/
COPY other/glversion /etc/glversion
COPY other/config /etc/config
COPY other/lighttpd /usr/sbin/
COPY start.sh /start.sh
RUN mv /www/cgi-bin/api /www/cgi-bin/api2 && mkdir -p /www/cgi-bin/api/router/mesh
COPY other/status /www/cgi-bin/api/router/mesh/status
RUN echo 'Note - you are not supposed to have root on this box, please dont ruin it for everyone else' > /root/message.txt
RUN echo 'flag{hope_youre_comfortable_running_cmds_cuz_youll_Be_doing_it_a_lot}' > /flag.txt

# copy library files
COPY lib/ld-musl-mips-sf.so.1 /lib/
COPY lib/libgcc_s.so.1 /lib/
COPY lib/libubus.so.20210603 /lib/
COPY lib/libubox.so /lib/
COPY lib/libuci.so /lib/
COPY lib/libblobmsg_json.so /lib/
COPY usr_lib/libcrypto.so.1.1 /lib/
COPY usr_lib/libssl.so.1.1 /lib/
COPY usr_lib/libnl-tiny.so /lib/
COPY usr_lib/libcurl.so.4 /lib/
COPY usr_lib/libjson-c.so.2 /lib/
COPY usr_lib/libfcgi.so.0 /lib/
COPY usr_lib/libiwinfo.so /lib/
COPY usr_lib/libuuid.so.1 /lib/
COPY usr_lib/gl/libglwificore.so /lib/
COPY usr_lib/gl/libglutil.so /lib/
COPY usr_lib/libpcre.so.1 /lib/
COPY usr_lib/lighttpd /usr/lib/lighttpd

# remove helpful binaries that aren't normally on the router
RUN cd /bin && rm -rf apt* ar arch as b2sum base32 base64 c++* c89* c99* chattr cpan* cpp* diff* dpkg* g++* gcc* hostname perl*

# prevent lockout from password brute forcing
RUN echo -n '0' > /tmp/login_errortimes

# use unprivileged user
RUN useradd -M unpriv
RUN chown -R unpriv:unpriv /var/log/lighttpd/
RUN chmod +x /start.sh
RUN chmod -R +r /etc/config
RUN chmod +r /flag.txt
USER unpriv

# run lighttpd
CMD ["bash","/start.sh"]

EXPOSE 80
EXPOSE 443