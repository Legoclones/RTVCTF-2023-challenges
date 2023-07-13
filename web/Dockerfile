FROM ubuntu:22.04

# install dependencies
RUN apt update && apt upgrade -y && apt dist-upgrade -y
RUN apt install -y lighttpd redis-tools

# install latest redis version
RUN apt install lsb-release curl gpg -y
RUN curl -fsSL https://packages.redis.io/gpg | gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
RUN echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/redis.list
RUN apt-get update -y
RUN apt-get install redis -y

# move files
COPY www /www
COPY lighttpd.conf /etc/lighttpd/lighttpd.conf
COPY start.sh /start.sh
COPY redis.conf /etc/redis/redis.conf
COPY redis.start /redis.start
COPY creds.txt /creds.txt

# create unpriv user
RUN useradd -M unpriv
RUN chmod 755 /www

ENV flag=flag{redis_from_a_distance_ftw}

# run start script
CMD ["bash", "/start.sh"]

# REMOVE
EXPOSE 80