lines = (@line "\n")*

line = lhs:lhs _ '->' _ rhs:rhs { return {lhs, rhs} }

lhs
  = b:$"broadcaster" { return [b, b] }
  / [&%] module
rhs = module|1.., ", "|
module = $[a-z]+

num = n:$[0-9]+ { return parseInt(n, 10) }
_ = [ \t]+
