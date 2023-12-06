race = t:time d:distance {
  const res = []
  for (let i = 0; i < t.length; i++) {
    res.push({time: t[i], dist: d[i]});
  }
  return res;
}
time = "Time:" _ @num|1..4, _| "\n"
distance = "Distance:" _ @num|1..4, _| "\n"

num = n:$[0-9]+ { return parseInt(n, 10) }
_ = [ \t]+
