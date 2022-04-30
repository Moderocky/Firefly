Firefly
=====

### Opus #18

A language highlighter module written in JavaScript, catering to languages with non-standard grammar. 

### Description

Existing highlighters have difficulty evaluating some languages on account of their unusual structure. \
This leads either to *too many matches*, 
where elements are recognised in completely illegal contexts, 
or to *too few matches* where overly-complex matching rules eliminate legal edge-cases in order to avoid making mistakes.

This is especially problematic for languages which depend heavily on whitespace (e.g. Skript, Python) to recognise their hierarchy, but also for languages that use bracket-pairs to denote possession.

Firefly aims to solve the first by giving a clear insight into the element tree to help a language's matcher recognise the elements that came before. \
The second will require some special, non-regex bracket-matching that goes on behind the scenes. \
Through the use of an accessible match `context` both should be possible.

#### Goals
1. Simple language grammars should be very easy to build.
2. The model should be extensible for very complex languages.
3. The matcher should aim for a balance between reliability (spotting correct elements) and accuracy (ignoring incorrect elements.)

#### Non-goals
1. Formatting and displaying the result will not be a priority.
2. Specific languages will not be implemented (although users may contribute grammars.)
3. Language code/side effects will not be evaluated.

