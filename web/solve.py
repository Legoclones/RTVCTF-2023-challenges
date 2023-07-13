from pwn import *


# initialize the binary
binary = "www/api"
elf = context.binary = ELF(binary, checksec=False)

gs = """
break main
continue
"""


# envvars
env = {
    #"LD_PRELOAD": "./libc.so.6"
    "PATH_INFO": "/create",
    "REQUEST_METHOD": "POST",
    "HTTP_COOKIE": "session",
    "CONTENT_LENGTH": "2",
}

if args.GDB:
    p = gdb.debug(binary, gdbscript=gs, env=env)
else:
    p = elf.process(env=env)

p.send("ab")

p.interactive()