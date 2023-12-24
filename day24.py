from z3 import Int, Solver, sat

f = open('inputs/day24.txt')
a = [x.split('@') for x in f.readlines()]
b = [
  [[int(z) for z in x.split(', ')], [int(z) for z in y.split(', ')]]
  for x,y in a
]

px, py, pz = Int("px"), Int("py"),  Int("pz")
vx, vy, vz = Int("vx"), Int("vy"), Int("vz")
s = Solver()

# Only need three points to solve this set
for i, ((x, y, z), (dx, dy, dz)) in enumerate(b[:3]):
  t = Int(f"t{i}")
  s.add(t >= 0)
  s.add((x + (dx * t)) == (px + (vx * t)))
  s.add((y + (dy * t)) == (py + (vy * t)))
  s.add((z + (dz * t)) == (pz + (vz * t)))
assert str(s.check()) == 'sat'

print(s.model().eval(px + py + pz))
