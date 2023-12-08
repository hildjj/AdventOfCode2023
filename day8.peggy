map = directions:direction+ "\n\n" map:nodes {
  return {directions, map}
}

direction = [LR]
nodes = n:node+ {
  return Object.fromEntries(n)
}
node = from:station _ "=" _ "(" L:station "," _ R:station ")\n" {
  return [from, {L, R}];
}

station = $[A-Z0-9]|3|
_ = [ \t]+
