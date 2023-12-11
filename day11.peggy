{
  const locs = []
}
lines = lines:(@line "\n")* { return {
    locs,
    height: lines.length,
    width: lines[0].length
  }
}

line = c:char+

char
  = '#' { locs.push(location().start) }
  / '.'
