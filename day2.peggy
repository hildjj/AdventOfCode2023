lines = (@line "\n")*

line = "Game " @num ":" @draw|.., ";"|

draw = c:color|.., ','| { return Object.fromEntries(c) }

color = _ n:num _ c:("red" / "green" / "blue") { return [c, n] }

num = n:$[0-9]+ { return parseInt(n, 10) }

_ = [ \t]*
