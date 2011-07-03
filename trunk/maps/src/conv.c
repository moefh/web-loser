/* conv.c */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAP_MAGIC_0   0x0050414d
#define MAP_MAGIC_1   0x0150414d
#define MAP_MAGIC_2   0x0250414d

typedef struct NPC_DICT {
  int npc;
  char name[256];
} NPC_DICT;

static NPC_DICT default_npc_dict[] = {
  { 1000, "cannon" },
  { 1001, "ghost/chaser" },
  { 1002, "orange" },
  { 1003, "loser-shadow" },
  { 1004, "meat/ball" },
  { 1005, "meat/lord" },
  { 1006, "meat/slug" },
  { 1007, "ghost/walker" },

  { 2000, "tele/teleporter" },
  { 2001, "tele/target" },
  { 2002, "energy" },
  { 2003, "invincibility" },
  { 2004, "power-up" },
  { 2005, "shadow" },
  { 2006, "route" },
  { 2008, "scenario/water" },
  { 2009, "door/up" },
  { 2010, "door/down" },
  { 2011, "door/left" },
  { 2012, "door/right" },
  { 2013, "lever/star" },
  { 2014, "lever/star-invisible" },
  { 2015, "tele/teleporter-invisible" },
  { 2016, "scenario/moss" },
  { 2017, "lever/down" },
  { 2018, "lever/top" },
  { 2019, "lever/left" },
  { 2020, "lever/right" },
  { 2021, "tele/door" },
  { 2022, "scenario/eyes" },
  { 2023, "info/text" },
  { 2024, "info/arrow-exit" },
  { 2025, "info/arrow-down" },
  { 2026, "info/arrow-up" },
  { 2027, "info/arrow-left" },
  { 2028, "info/arrow-right" },
  { 2029, "door/rock-up" },
  { 2030, "door/rock-down" },
  { 2031, "door/rock-left" },
  { 2032, "door/rock-right" },
  { 2033, "door/plat-left" },
  { 2034, "door/plat-right" },
  { 2035, "energy-tank" },

  { 10000, "text" },

  { -1, "" }
};

void die(char *msg)
{
  printf("%s\n", msg);
  exit(1);
}

int get_u8(FILE *f)
{
  return fgetc(f);
}

int get_u16(FILE *f)
{
  int c1, c2;

  c1 = get_u8(f);
  if (c1 < 0) return -1;
  c2 = get_u8(f);
  if (c2 < 0) return -1;
  return ((c2 & 0xff) << 8) | (c1 & 0xff);
}

unsigned int get_u32(FILE *f)
{
  int c1, c2, c3, c4;

  c1 = get_u8(f);
  if (c1 < 0) return 0xffffffffu;
  c2 = get_u8(f);
  if (c2 < 0) return 0xffffffffu;
  c3 = get_u8(f);
  if (c3 < 0) return 0xffffffffu;
  c4 = get_u8(f);
  if (c4 < 0) return 0xffffffffu;

  return ((c4 & 0xff) << 24) | ((c3 & 0xff) << 16) | ((c2 & 0xff) << 8) | (c1 & 0xff);
}

int get_string(FILE *f, char *str, int max)
{
  int len, i;
  
  len = get_u8(f);
  if (len < 0)
    return -1;

  for (i = 0; i < len; i++) {
    int c = get_u8(f);
    if (c < 0)
      return -1;
    if (i < max)
      str[i] = c;
  }
  if (i >= max)
    i = max - 1;
  str[i] = '\0';
  return len;
}


void write_string(FILE *out, char *str)
{
  // TODO: properly escape string
  fprintf(out, "\"%s\"", str);
}

static int read_npc_dict(FILE *in, NPC_DICT **ret)
{
  int n_npcs, i;
  int n_bytes = 0;
  NPC_DICT *npc_dict;

  n_npcs = get_u16(in);
  n_bytes += 2;
  if (n_npcs <= 0)
    return n_bytes;
  npc_dict = (NPC_DICT *) malloc(sizeof(NPC_DICT) * (n_npcs + 1));
  if (npc_dict < 0)
    return -1;
  for (i = 0; i < n_npcs; i++) {
    int len;
    npc_dict[i].npc = get_u16(in);
    len = get_string(in, npc_dict[i].name, sizeof(npc_dict[i].name));
    n_bytes += 3 + len;
    //printf("got dict entry: { %d, \"%s\" }\n", npc_dict[i].npc, npc_dict[i].name);
  }
  npc_dict[n_npcs].npc = -1;
  npc_dict[n_npcs].name[0] = '\0';

  *ret = npc_dict;
  return n_bytes;
}

char *find_npc(NPC_DICT *dict, int npc)
{
  int i;
  for (i = 0; dict[i].npc >= 0; i++)
    if (npc == dict[i].npc)
      return dict[i].name;
  return "unknown";
}

void conv_map_objects(FILE *in, FILE *out, NPC_DICT *dict)
{
  int n_objs, i;

  fprintf(out, "  \"objects\" : [\n");

  n_objs = get_u32(in);
  for (i = 0; i < n_objs; i++) {
    int npc_id = 0;
    int x = 0;
    int y = 0;
    int dir = 0;
    int respawn = 0;
    int level = 0;
    int duration = 0;
    int target = -1;
    int vulnerability = 100;
    char text[256] = "";
    int size, j;

    size = get_u16(in);
    for (j = 0; j < size; j++) {
      short data = (short) get_u16(in);
      switch (j) {
      case 0:
	npc_id = data;
	if (data == 10000) {  // MAP_MAP_TEXT
	  int txt_len = (size - 1) * 2;
	  if (txt_len > 256) {
	    int k;

	    fread(text, 1, 256, in);
	    for (k = 256-1; k < txt_len; k++)
	      get_u8(in);
	    text[256-1] = '\0';
	  } else {
	    fread(text, 1, txt_len, in);
	    text[txt_len] = '\0';
	  }
	  j = size; // stop reading
	}
	break;

      case 1: x = data; break;
      case 2: y = data; break;
      case 3: dir = data; break;
      case 4: respawn = data; break;
      case 5: level = data; break;
      case 6: duration = data; break;
      case 7: target = data; break;
      case 8: vulnerability = data; break;
      }
    }

    fprintf(out, "    {\n");

    fprintf(out, "      \"npc\" : ");
    write_string(out, find_npc(dict, npc_id));
    //fprintf(out, ", // %d\n", npc_id);
    fprintf(out, ",\n");

    if (text[0] != '\0') {
      fprintf(out, "      \"text\" : ");
      write_string(out, text);
      fprintf(out, ",\n");
    }

    fprintf(out, "      \"x\" : %d,\n", x);
    fprintf(out, "      \"y\" : %d,\n", y);
    fprintf(out, "      \"dir\" : %d,\n", dir);
    fprintf(out, "      \"respawn\" : %d,\n", respawn);
    fprintf(out, "      \"level\" : %d,\n", level);
    fprintf(out, "      \"duration\" : %d,\n", duration);
    fprintf(out, "      \"target\" : %d,\n", target);
    fprintf(out, "      \"vulnerability\" : %d\n", vulnerability);
    
    fprintf(out, "    }");
    if (i != n_objs-1)
      fprintf(out, ",\n");
    else
      fprintf(out, "\n");
  }
  fprintf(out, "  ],\n\n");
}

void conv_map(FILE *in, FILE *out, char *src_name)
{
  unsigned int magic;
  int version, i, j;
  int w, h;
  char str[1024];
  NPC_DICT *npc_dict = NULL;
  unsigned short *tiles_bg, *tiles_fg, *tiles_clip;
  
  magic = get_u32(in);
  switch (magic) {
  case MAP_MAGIC_0: version = 0; break;
  case MAP_MAGIC_1: version = 1; break;
  case MAP_MAGIC_2: version = 2; break;
  default:
    printf("ERROR: bad map magic (%x)\n", magic);
    return;
  }

  printf("map version: %d\n", version);

  fprintf(out, "{\n");

  fprintf(out, "  \"conversion\" : \"Map converted from '%s'\",\n\n", src_name);

  // author
  if (get_string(in, str, sizeof(str)) < 0)
    die("EOF reading author");
  fprintf(out, "  \"author\" : ");
  write_string(out, str);
  fprintf(out, ",\n");

  // comments
  if (get_string(in, str, sizeof(str)) < 0)
    die("EOF reading commnents");
  fprintf(out, "  \"comments\" : ");
  write_string(out, str);
  fprintf(out, ",\n");

  // tileset
  if (get_string(in, str, sizeof(str)) < 0)
    die("EOF reading tileset");
  fprintf(out, "  \"tileset\" : ");
  write_string(out, str);
  fprintf(out, ",\n\n");

  // parameters
  fprintf(out, "  \"maxyspeed\" : %d,\n", get_u32(in));
  fprintf(out, "  \"jumphold\" : %d,\n", get_u32(in));
  fprintf(out, "  \"gravity\" : %d,\n", get_u32(in));
  fprintf(out, "  \"maxxspeed\" : %d,\n", get_u32(in));
  fprintf(out, "  \"accel\" : %d,\n", get_u32(in));
  fprintf(out, "  \"jumpaccel\" : %d,\n", get_u32(in));
  fprintf(out, "  \"friction\" : %d,\n", get_u32(in));
  fprintf(out, "  \"frameskip\" : %d,\n\n", get_u32(in));

  // tile size
  if (version >= 1) {
    unsigned int w = get_u32(in);
    unsigned int h = get_u32(in);
    fprintf(out, "  \"tile_size\" : [ %d, %d ],\n", w, h);
  } else {
    fprintf(out, "  \"tile_size\" : [ 64, 64 ],\n");
  }

  // map size
  w = (int) get_u32(in);
  h = (int) get_u32(in);

  if (w <= 0 || h <= 0 || w*h <= 0)
    die("bad map size");
  fprintf(out, "  \"size\" : [ %d, %d ],\n\n", w, h);

  // dictionary
  if (version >= 2) {
    int n_bytes, dict_len;

    n_bytes = (int) get_u32(in);
    dict_len = read_npc_dict(in, &npc_dict);
    if (dict_len < 0)
      die("bad dictionary");
    n_bytes -= dict_len;
    while (n_bytes-- > 0)
      get_u8(in);
  } else {
    npc_dict = default_npc_dict;
  }

  // objects
  if (version >= 1)
    conv_map_objects(in, out, npc_dict);

  // read tiles & clipping
  tiles_bg = (unsigned short *) malloc(sizeof(unsigned short) * w * h);
  tiles_fg = (unsigned short *) malloc(sizeof(unsigned short) * w * h);
  tiles_clip = (unsigned short *) malloc(sizeof(unsigned short) * w * h);
  for (i = 0; i < h; i++)
    for (j = 0; j < w; j++) {
      tiles_bg[i*w+j] = get_u16(in);
      tiles_fg[i*w+j] = get_u16(in);
      tiles_clip[i*w+j] = get_u16(in);
    }

  // background tiles
  fprintf(out, "  \"bg_tiles\" : [\n");
  for (i = 0; i < h; i++) {
    fprintf(out, "    [ ");
    for (j = 0; j < w; j++) {
      fprintf(out, " %u", tiles_bg[i*w+j]);
      if (j != w-1)
	fprintf(out, ",");
    }
    fprintf(out, " ]");
    if (i != h-1)
      fprintf(out, ",\n");
    else
      fprintf(out, "\n");
  }
  fprintf(out, "  ],\n");

  // background tiles
  fprintf(out, "  \"fg_tiles\" : [\n");
  for (i = 0; i < h; i++) {
    fprintf(out, "    [ ");
    for (j = 0; j < w; j++) {
      fprintf(out, " %u", tiles_fg[i*w+j]);
      if (j != w-1)
	fprintf(out, ",");
    }
    fprintf(out, " ]");
    if (i != h-1)
      fprintf(out, ",\n");
    else
      fprintf(out, "\n");
  }
  fprintf(out, "  ],\n");

  // clipping
  fprintf(out, "  \"clipping\" : [\n");
  for (i = 0; i < h; i++) {
    fprintf(out, "    [ ");
    for (j = 0; j < w; j++) {
      fprintf(out, " %u", tiles_clip[i*w+j]);
      if (j != w-1)
	fprintf(out, ",");
    }
    fprintf(out, " ]");
    if (i != h-1)
      fprintf(out, ",\n");
    else
      fprintf(out, "\n");
  }
  fprintf(out, "  ]\n");

  fprintf(out, "}\n");

  free(tiles_bg);
  free(tiles_fg);
  free(tiles_clip);
  if (npc_dict != default_npc_dict)
    free(npc_dict);
}

int main(int argc, char *argv[])
{
  FILE *in, *out;
  char *src_name;

  if (argc != 3) {
    printf("USAGE: %s input.map output.js\n", argv[0]);
    return 0;
  }

  in = fopen(argv[1], "r");
  if (! in) {
    printf("ERROR: can't open '%s'\n", argv[1]);
    exit(1);
  }
  out = fopen(argv[2], "w");
  if (! out) {
    printf("ERROR: can't open '%s'\n", argv[2]);
    exit(1);
  }

  src_name = strrchr(argv[1], '/');
  if (src_name == NULL)
    src_name = argv[1];
  else
    src_name++;
  conv_map(in, out, src_name);

  fclose(in);
  fclose(out);
  return 0;
}
