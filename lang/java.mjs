import {Language, Highlighter, Element} from "../firefly.mjs";

const type = {
    keywords: new Element('keyword', /\b(?:class|interface|record|enum|implements|extends)\b/),
    modifiers: new Element('keyword', /\b(?:static|abstract|sealed|non-sealed|final|synthetic)\b/),
    name: new Element('class', /\b(?:[a-zA-Z_$][a-zA-Z\d_$]*\.)*[a-zA-Z_$][a-zA-Z\d_$]*\b(?!\()/)
};
const visibility = new Element('keyword', /\b(?:public|private|protected)\b/);
const classModifiers = new Element('keyword', /\b(?:static|abstract|sealed|non-sealed|default|final|volatile|transient|synthetic|bridge|synchronized|strictfp)\b/);
const modifiers = new Element('keyword', /\b(?:static|abstract|sealed|non-sealed|default|final|volatile|transient|synthetic|bridge|synchronized|strictfp)\b/);
const method = new Element('method', /\b((?:[a-zA-Z_$][a-zA-Z\d_$]*\.)*[a-zA-Z_$][a-zA-Z\d_$]*)\s*(\()(\))/,
    new Element('method-name', /.+/),
    new Element('punctuation', /\(/),
    new Element('punctuation', /\)/)
);

const openingBrace = new Element('punctuation', /{/);
const closingBrace = new Element('punctuation', /}/);

const classDeclaration = new Element('class-declaration', /^([^{]+)({)([\s\S]*)(})\s*$/,
    new Element( 'class-header', /^[^{]+$/,
        visibility,
        type.modifiers,
        type.keywords,
        type.name
    ),
    openingBrace,
    new Element( 'class-body', /[\s\S]*/),
    closingBrace
);

class Java extends Language {

    static language = new Java();

    constructor() {
        super(
            classDeclaration
        );
    }

}

Highlighter.register(Java.language);
export {Java};
