lines = (@line "\n")*

line = cards:hand _ bid:num { return {cards, bid} }
hand = [AKQJT2-9]|5|
num = n:$[0-9]+ { return parseInt(n, 10) }
_ = [ \t]+
