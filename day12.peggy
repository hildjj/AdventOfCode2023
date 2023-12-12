lines = (@line "\n")*

line = springs:$(spring+) _ groups:num|.., ','| { return {springs, groups} }

spring
  = "."+ { return "." } // Compress dots
  / "?"
  / "#"

num = n:$[0-9]+ { return parseInt(n, 10) }
_ = [ \t]+
