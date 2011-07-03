
CC = gcc
CFLAGS = -O2 -Wall
LDFLAGS =

OBJS = spr2bmp.o bitmap.o gz_open.o

.PHONY: all clean

all: spr2bmp

clean:
	rm -f *.o *~

spr2bmp: $(OBJS)
	$(CC) $(LDFLAGS) -o $@ $(OBJS)

%.o: %.c
	$(CC) $(CFLAGS) -o $@ -c $<

