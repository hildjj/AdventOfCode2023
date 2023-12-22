lines = line+

line = @num|3, ","| "~" @num|3, ","| "\n"

num = n:$[0-9]+ { return parseInt(n, 10) }
_ = [ \t]+
