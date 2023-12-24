lines = (@line "\n")*

line = @num|3, ',' _| _ '@' _ @num|3, ',' _|
num = n:$('-'? [0-9]+) { return parseInt(n, 10) }
_ = [ \t]+
