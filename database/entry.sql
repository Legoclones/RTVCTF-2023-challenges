-- Setup database and unpriv user
CREATE DATABASE ctf;
CREATE USER 'ctf'@'%' IDENTIFIED BY 'b6ee647c25a29b03e6cdb94a84cd1f9b93299e14a698b7ae' FAILED_LOGIN_ATTEMPTS 0;
GRANT SELECT ON ctf.* TO 'ctf'@'%';
FLUSH PRIVILEGES;

-- Create schema for ctf db
CREATE TABLE flag (
    id INT NOT NULL AUTO_INCREMENT,
    flag VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);
INSERT INTO flag (flag) VALUES ('flag{I_hope_the_web_pwn_was_fun_XD}');