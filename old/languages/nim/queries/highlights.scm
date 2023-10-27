((ident) @support.type.nim
 (#match? @support.type.nim "^[A-Z].*$"))
(typeDesc (primary (symbol (ident) @storage.type)))
((ident) @storage.type
 (#match? @storage.type "^(int|int8|int16|int32|int64|uint|uint8|uint16|uint32|uint64|float|float32|float64|bool|string|char|typed|untyped|openArray|seq|array|set)$"))
((ident) @keyword
 (#match? @keyword "^(echo|declared|low|high|ord|async|await)$"))

(routine (keyw) (ident (symbol (ident) @variable.function)))

"=" @punctuation
":" @punctuation
"." @punctuation
"," @punctuation
";" @punctuation
"(" @punctuation
")" @punctuation
"[" @punctuation
"]" @punctuation
"{" @punctuation
"}" @punctuation

(primary
  (primarySuffix) @variable.function
  .
  (primarySuffix (functionCall))
)
(primary
  .
  (_) @variable.function
  .
  (primarySuffix (functionCall))
)

(ident) @variable

[
  (str_lit)
  (rstr_lit)
  (triplestr_lit)
  (generalized_str_lit)
] @string

(int_lit) @constant.numeric

(comment) @comment

(operator) @keyword.operator

(keyw) @keyword

[
  "nil"
  "true"
  "false"
] @keyword

