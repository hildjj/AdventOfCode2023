lines = (@line "\n")*

line = "Card" _ @num ":" _ @nums _ "|" _ @nums

nums = num|.., _|
num = n:$[0-9]+ { return parseInt(n, 10) }
_ = [ \t]+
