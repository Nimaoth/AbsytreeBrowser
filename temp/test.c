#include "stdio.h"

typedef struct {
    int a;
    int b;
} Point;

typedef struct {
    float b;
} Bar;

int main() {
    int a = 5;
    int* b = &a;
    if (*b > 3) {
        printf("b = %d", *b);
    }
    while (1) {
        Point p;
        Bar b;
    }
}
