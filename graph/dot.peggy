/*
 * Grammar to parse the graphviz dot/xdot language.
 *
 * This file is based on https://raw.githubusercontent.com/anvaka/dotparser/main/grammar/dot.pegjs,
 * which is based on https://github.com/siefkenj/dotgraph,
 * just tightened up and modernized a small amount.
 */

start
  = graph+

graph
  = _ strict:"strict"i? _ type:("graph"i / "digraph"i) _ id:ID? _ "{" children:stmt_list? _ "}" _ {
      const ret = {
        type: type.toLowerCase(),
        strict: Boolean(strict),
        children: children ?? [],
      };
      if (id) { ret.id = id }
      return ret;
    }

stmt_list
  = (_ @stmt _ ";"?)+

stmt
  // an assignment as a statement e.g. 'label=4' is shorthand for 'graph [label=4]',
  // so let's just pretend that's what we wrote
  = left:ID _ '=' _ right:ID {
    return {
      type:'attr_stmt',
      target: 'graph',
      attrList:[{
        type: 'attr',
        id: left,
        eq: right
      }]
    };
  }
  / attr_stmt
  / edge_stmt
  / subgraph
  / node_stmt
  / ID '=' ID

attr_stmt
  = target:('graph'i/'node'i/'edge'i) attrList:attrList {
     return {
       type:'attr_stmt',
       target,
       attrList,
     };
  }

attrList
  = _ '[' _ list:a_list? _ ']' _ rest:attrList? {
    return [...(list ?? []), ...(rest ?? [])];
  }

a_list
  = attr+

attr = _ id:ID eq:(_ '=' _ @ID)? _ (',' / ';')? {
  return {
    type:'attr',
    id,
    eq,
  }
}

edge_stmt
  = id:(subgraph / nodeId) rhs:edgeRHS attr:attrList? {
    const edgeList = [id, ...rhs.map((v) => v.id)];

    return {
      type: 'edge_stmt',
      edgeList,
      attrList: attr ?? []
    };
  }

edgeRHS
  = edgeRH+

edgeRH
  = _ edgeop:('->'/'--') _ id:(subgraph / nodeId) {
    return {
      type:'edgeRHS',
      edgeop:edgeop,
      id
    }
  }

node_stmt
  = id:nodeId attr:attrList? {
    return {
      type: 'node_stmt',
      id,
      attrList:attr ?? []
    };
  }

nodeId
  = id:ID port:port? {
    return port ? { type:'node_id', id, port } : { type:'node_id', id };
  }

port 'port'
  = ':' id:ID pt:(':' @compassPt)? {
    return {
      type:'port',
      id:id,
      compassPt:pt ?? null
    };
  }
  //I think this rule is never used...
  / ':' pt:compassPt {
    return {
      type:'port',
      compassPt:pt ?? null
    }
  }

subgraph
  = g:('subgraph'i _ id:ID? _ {
        return id ? {
          type:'subgraph', id:id
        } : {
          type:'subgraph'
        }
      })? '{' s:stmt_list? _ '}' {
        g = g ?? {
          type:'subgraph'
        };
        g.children = s ?? [];
        return g;
      }

compassPt
  = 'ne'/'nw'/'n'/'e'/'se'/'sw'/'s'/'w'

ID
  = STRING
  / NUMBER_STRING
  / NUMBER
  / QUOTED_STRING
  / HTML_STRING

STRING "UNICODE_STRING"
  = first:StringStart rest:StringPart* {
      return first + rest.join('');
    }
    
NUMBER_STRING
  = first:NUMBER rest:STRING {
    return first + rest;
  }
  
StringStart
  = UnicodeLetter
  / "$"
  / "_"

StringPart
  = StringStart
  / UnicodeDigit

NUMBER "NUMBER"
  = n:("-"? ("." [0-9]+ / [0-9]+("." [0-9]*)?)) {
       return parseFloat(text());
    }

/* html strings are enclosed in <>. The inside of those strings is xml.  All we
 * care about is a balanced number of <'s and >'s, so we can simplify our life
 * a little by just matching balanced expressions, and then returning what's
 * inside the outermost <> pair
 */
HTML_STRING
  = v:html_raw_string {
      return {
        type: 'id',
        value: v.slice(1,v.length-1),
        html: true
      };
    }

html_raw_string
  = '<' v:(html_char / html_raw_string)* '>' {
      return '<' + v.join('') + '>';
    }

html_char
  = v:(!('>'/'<') v:SourceCharacter { return v; })+ { return v.join(""); }

QUOTED_STRING
  = '"' chars:DoubleStringCharacter* '"' { return chars.join(""); }

DoubleStringCharacter
  = QuoteEscape
  / !('"' / LineTerminator) SourceCharacter { return text(); }
  / LineContinuation

QuoteEscape
  = v:("\\".) { return v[1] === '"' ? '"' : v[0] + v[1]; }

LineContinuation
  = "\\" LineTerminatorSequence { return ""; }

LineTerminator
  = [\n\r\u2028\u2029]

LineTerminatorSequence "end of line"
  = "\n"
  / "\r\n"
  / "\r"
  / "\u2028"
  / "\u2029"

chars
  = chars:char+ { return chars.join(""); }

char
  = [^"\\\0-\x1F\x7f]
  / '\\"' { return '"'; }
  / '\\' NEWLINE { return ""; }
  / '\\' { return '\\'; }


COMMENT "COMMENT"
 = (BLOCK_COMMENT / C_COMMENT / MACRO_COMMENT)

BLOCK_COMMENT "BLOCK_COMMENT"
  = "/*" v:(!"*/" v:. {return v;})* "*/" { return v.join('') }

C_COMMENT "C_COMMENT"
  = "//" v:(![\n] v:. { return v; })* [\n]? { return v.join(''); }

MACRO_COMMENT "MACRO_COMMENT"
  = "#" v:(![\n] v:. { return v; })* [\n]? { return v.join(''); }

_ "WHITESPACE"
  = (WHITESPACE / COMMENT)*

NEWLINE
  = [\n\r]+

WHITESPACE
  = ([ \t] / NEWLINE)+

UnicodeLetter
  = Lu
  / Ll
  / Lt
  / Lm
  / Lo
  / Nl

UnicodeDigit
  = Nd

Ll "Letter, Lowercase"
  = @c:SourceCharacter &{ return /\p{Ll}/u.test(c) }

Lm "Letter, Modifier"
  = @c:SourceCharacter &{ return /\p{Lm}/u.test(c) }

Lo "Letter, Other"
  = @c:SourceCharacter &{ return /\p{Lo}/u.test(c) }

Lt "Letter, Titlecase"
  = @c:SourceCharacter &{ return /\p{Lt}/u.test(c) }

Lu "Letter, Uppercase"
  = @c:SourceCharacter &{ return /\p{Lu}/u.test(c) }

Nl "Number, Letter"
  = @c:SourceCharacter &{ return /\p{Nl}/u.test(c) }

Nd "Number, Decimal Digit"
  = @c:SourceCharacter &{ return /\p{Nd}/u.test(c) }

SourceCharacter
  = SourceCharacterLow
  / SourceCharacterHigh

// Not surrogates
SourceCharacterLow
  = [\u0000-\uD7FF\uE000-\uFFFF]

// Can be properly-matched surrogates or lone surrogates.
SourceCharacterHigh
  = $([\uD800-\uDBFF][\uDC00-\uDFFF]) // Surrogate pair
  / [\uD800-\uDBFF] // Lone first surrogate
  / [\uDC00-\uDFFF] // Lone second surrogate
