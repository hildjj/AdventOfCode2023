lines = workflows:(@workflow "\n")* "\n" parts:(@part "\n")* {
  return {workflows: Object.fromEntries(workflows), parts}
}

workflow = @name "{" @rule|1.., ","| "}"
rule
  = xmas:xmas op:op num:num ":" dest:dest { return {xmas, op, num, dest}}
  / dest:dest { return {dest} }

dest = "R" / "A" / name

part = "{" vals:val|.., ","| "}" { return Object.fromEntries(vals) }
val = @xmas "=" @num
xmas = [xmas]
op = [<>]

name = $[a-z]|2..3|

num = n:$[0-9]+ { return parseInt(n, 10) }
_ = [ \t]+
