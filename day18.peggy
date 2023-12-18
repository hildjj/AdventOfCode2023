lines = (@line "\n")*
line = dir:dir _ len:num _ "(" "#" color:$[a-f0-9]+ ")" {
  return { dir, len, color }
}

dir = d:[RDLU]

num = n:$[0-9]+ { return parseInt(n, 10) }
_ = [ \t]+
