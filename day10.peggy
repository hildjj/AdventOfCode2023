//  1
// 2 3
//  4

{
let start = null;
}
lines = cells:(@cell* "\n")* {
  return {
    start,
    cells,
  }
}

cell
  = [|LJ7F\.-]
  / char:'S' {
    start = location().start;
    return char;
  }

