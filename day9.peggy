lines = (@line "\n")*

line = num|.., _|

num = n:$("-"? [0-9]+) { return parseInt(n, 10) }
_ = [ \t]+
