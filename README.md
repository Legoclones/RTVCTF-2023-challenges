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

Once the user has admin access, they need to leverage that to get RCE on the underlying file system. There are two options here - there's a previously discovered RCE vulnerability that works (see `rce.py`), or the user can find their own RCE vulnerability. The flag is found in `/flag.txt`. Note that both `rce.py` and `scanner.py` come from publicly-available PoCs, but require some minor changes to them.




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
asdf




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
asdf