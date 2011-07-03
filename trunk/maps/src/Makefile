
CC = gcc
CFLAGS = -O2 -Wall
LDFLAGS =

OBJS = conv.o

.PHONY: all clean

all: conv

clean:
	rm -f *.o *~

conv: $(OBJS)
	$(CC) $(LDFLAGS) -o $@ $(OBJS)

%.o: %.c
	$(CC) $(CFLAGS) -o $@ -c $<

