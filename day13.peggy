patterns = pattern|.., '\n'|

pattern = line+

line = n:char+ "\n" { return new Uint8Array(n) }

char
  = '.' { return 0 }
  / '#' { return 1 }


