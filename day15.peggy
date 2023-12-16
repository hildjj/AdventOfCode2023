lines = @entry|.., ','| "\n"

entry
  = lens:$[a-z]+ op:"-" { return { str: text(), lens, op }}
  / lens:$[a-z]+ op:"=" focal:num { return { str: text(), lens, op, focal }}

op = "-" / "="

num = n:$[0-9]+ { return parseInt(n, 10) }
_ = [ \t]+
