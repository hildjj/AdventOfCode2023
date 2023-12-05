almanac = @seeds "\n\n" @map|.., "\n"|

seeds = "seeds:" _ @num|.., _|

map = @name @range|.., "\n"| "\n"

name = @$[a-z]+ "-to-" @$[a-z]+ " map:\n"

range = dest:num _ src:num _ len:num { return {dest, src, len} }

num = n:$[0-9]* { return parseInt(n, 10) }
_ = [ \t]+
