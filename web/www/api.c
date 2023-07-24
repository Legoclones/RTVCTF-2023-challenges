#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

// this ensures that you don't need to flush stdout when calling printf
__attribute__((constructor)) void flush_buf() {
    setbuf(stdin, NULL);
    setbuf(stdout, NULL);
    setbuf(stderr, NULL);
}

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

// still need to implement and connect to MySQL db, gotta look that up
void get_notes() {
    printf("Content-Type: application/json\r\n\r\n");
    printf("{\"error\":false,\"notes\":[\"title\":\"Test note\",\"content\":\"MySQL hasn't been integrated, so notes aren't saved.\"]}");
}

// debugging
void create_note(char* content_length) {
    printf("\r\n\r\n");
    char body[0x100];

    puts(content_length);
    int length = atoi(content_length);

    read(0, body, length);
    // print out body to ensure it was transmitted right
    puts(body);
}

void delete_note(char* path) {
    int note_id = atoi(path);

    // check if note id is valid
    if ((note_id < 0) || (note_id > 0x100)) {
        printf("Content-Type: application/json\r\n\r\n");
        printf("{\"error\":true,\"msg\":\"Invalid note ID\"}\r\n");
        return;
    }

    // check that note ID is valid number
    if ((note_id == 0) && (strncmp("0",path,1))) {
        printf("Content-Type: application/json\r\n\r\n");
        printf("{\"error\":true,\"msg\":\"Invalid note ID\"}\r\n");
        return;
    }

    // todo - actually delete

    printf("Content-Type: application/json\r\n\r\n");
    printf("{\"error\":false,\"msg\":\"Your request has been successfully received.\"}");
}

// debug
void debug() {
    // open and print out creds.txt
    FILE* flag_file;
    char c;

    flag_file = fopen("/creds.txt", "r");

    if (flag_file != NULL) {
        printf("Creds: ");
        while ((c = getc(flag_file)) != EOF) {
            printf("%c", c);
        }
        printf("\n");
    }
    else {
        printf("Could not find /creds.txt\n");
    }
}

int main() {
    char* PATH = getenv("PATH_INFO");
    char* METHOD = getenv("REQUEST_METHOD");
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
        create_note(CONTENT_LENGTH);
    }

    // delete
    else if ((strcmp(METHOD, "DELETE") == 0) && (strncmp(PATH, "/delete", 7) == 0)) {
        // check privileges
        if (priv_level != ADMIN) {
            printf("Content-Type: application/json\r\n\r\n");
            printf("{\"error\":true,\"msg\":\"You must be an admin to delete notes\"}\r\n");
            return 0;
        }
        delete_note(PATH+8);
    }

    else {
        printf("Content-Type: application/json\r\n\r\n");
        printf("{\"error\":true,\"msg\":\"Unknown endpoint\"}\r\n");
    }

    return 0;
}