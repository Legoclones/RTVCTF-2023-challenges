#include <stdio.h>
#include <stdlib.h>
#include <string.h>

enum {
    NONE,
    USER,
    ADMIN
};

struct note {
    char title[0x21];
    char* content[0x101];
};

int priv_level = NONE;

int check_valid_cookie(char* cookie) {
    char cookie_name[0x21];
    char cookie_value[0x21];

    // check to see that = sign is present
    int equal_index = strchr(cookie, '=') - cookie;
    if ((equal_index > 0x20) || (equal_index < 0)) {
        return 0;
    }

    // copy cookie name and add null byte
    memcpy(cookie_name, cookie, equal_index);
    cookie_name[equal_index] = '\0';

    // get value
    int end_index = strchr(cookie, ';') - cookie;
    if (end_index < 0) {
        end_index = strlen(cookie);
    }
    int value_length = end_index - equal_index - 1;

    // ensure length is not > 0x20
    if (value_length > 0x20) {
        value_length = 0x20;
    }

    memcpy(cookie_value, cookie + equal_index + 1, value_length);
    cookie_value[value_length] = '\0';
    
    // ensure cookie name is 'session'
    if (strncmp(cookie_name, "session", 7) != 0) {
        return 0;
    }

    // ensure cookie value is all hex chars
    for (int i = 0; i < value_length; i++) {
        if (((cookie_value[i] < '0') || (cookie_value[i] > '9')) && ((cookie_value[i] < 'a') || (cookie_value[i] > 'f'))) {
            return 0;
        }
    }

    // see if session exists and priv level
    char* cmd = malloc(100);
    snprintf(cmd, 54+value_length, "printf 'auth user password\\nget session_%s' | redis-cli", cookie_value);
    FILE* fp = popen(cmd, "r");
    char* result = malloc(1000);
    fread(result, 1, 1000, fp);
    pclose(fp);

    // check
    if (strlen(result) < 8) {
        return 0;
    }

    if (strncmp(result+3, "user", 4) == 0) {
        priv_level = USER;
    } 
    else if ((strlen(result) >= 9) && (strncmp(result+3, "admin", 5) == 0)) {
        priv_level = ADMIN;
    } 
    else {
        return 0;
    }

    return 1;
}

void get_notes() {
    //
}

void create_note() {
    //
}

void delete_note() {
    //
}

int main() {
    char* PATH = getenv("PATH_INFO");
    char* METHOD = getenv("REQUEST_METHOD");
    char* QUERY_STRING = getenv("QUERY_STRING");
    char* CONTENT_LENGTH = getenv("CONTENT_LENGTH");
    char* COOKIES = getenv("HTTP_COOKIE");

    // check for valid request
    if ((PATH == NULL) || (METHOD == NULL)) {
        printf("Content-Type: application/json\r\n\r\n");
        printf("{\"error\":true,\"msg\":\"Invalid HTTP request\"}\r\n");
        return 0;
    }
    if (COOKIES == NULL) {
        printf("Content-Type: application/json\r\n\r\n");
        printf("{\"error\":true,\"msg\":\"Session cookie is not present\"}\r\n");
        return 0;
    }

    // user must be admin to perform any operations
    int valid = check_valid_cookie(COOKIES);

    if (valid == 0) {
        printf("Content-Type: application/json\r\n\r\n");
        printf("{\"error\":true,\"msg\":\"Invalid session cookie\"}\r\n");
        return 0;
    }

    if (priv_level == USER) {
        printf("X-Note: You can only view notes, not create or delete. Only admins can do that.\r\n");
    }
    else if (priv_level == ADMIN) {
        // send flag2
        printf("X-Flag: %s\r\n", getenv("FLAG"));
        printf("X-Note: Todo - switch over to MySQL from stack-based notes, see /creds.txt\r\n");
    }

    // get
    if ((strcmp(METHOD,"GET") == 0) && (strcmp(PATH, "/get") == 0)) {
        get_notes();
    }

    // create
    else if ((strcmp(METHOD, "POST") == 0) && (strcmp(PATH, "/create") == 0)) {
        // check privileges
        if (priv_level != ADMIN) {
            printf("Content-Type: application/json\r\n\r\n");
            printf("{\"error\":true,\"msg\":\"You must be an admin to create notes\"}\r\n");
            return 0;
        }
        puts("create");
    }

    // delete
    else if ((strcmp(METHOD, "DELETE") == 0) && (strncmp(PATH, "/delete", 7) == 0)) {
        // check privileges
        if (priv_level != ADMIN) {
            printf("Content-Type: application/json\r\n\r\n");
            printf("{\"error\":true,\"msg\":\"You must be an admin to delete notes\"}\r\n");
            return 0;
        }
        puts("delete");
    }

    else {
        printf("Content-Type: application/json\r\n\r\n");
        printf("{\"error\":true,\"msg\":\"Unknown endpoint\"}\r\n");
    }

    return 0;
}