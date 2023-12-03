lines = lines:(@line "\n")* { return lines.flat() }

line = $"."* @(num / sym)|.., $"."*| $"."*

num = n:$[0-9]+ { return {num: parseInt(n, 10), len: n.length, loc: location().start} }

sym = sym:[^.\r\n0-9] { return {sym, loc: location().start} }
