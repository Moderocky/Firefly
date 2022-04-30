


class Element {

    type; regex;
    relevance;
    elements = [];

    constructor(type, regex = /error/, relevance = 0, ...elements) {
        this.type = type;
        this.regex = regex;
        this.relevance = relevance;
    }

    match(context) {
        const text = context.current_text, outer = context.outer_match, start = context.expect_start;
        function reset() {
            context.current_text = text;
            context.outer_match = outer;
            context.expect_start = start;
            return null;
        }
        const result = this.regex.exec(text);
        if (!result) return reset();
        if (context.expect_start && result.index > 0) return reset();
        const children = [...this.elements];
        context.expect_start = false;
        if (result.length > 1) for (let i = 1; i < result.length; i++) {
            const element = children.shift();
            if (!element) throw new Error('Fewer sub-elements than groups in element: ' + this);
            context.outer_match = result;
            context.current_text = result[i];
            const result = element.match(context);
            if (!result) return reset();
        }
        for (let element of children) {
            context.outer_match = result;
            context.current_text = result[0];
            const match = element.match(context);
            if (!match) return reset();
        }
        context.expect_start = start;
        context.outer_match = outer;
        context.current_text = text.substring(result[0].length);
    };

}

class Language {
    elements = [];
    constructor(...elements) {
        for (let element of elements) if (!element instanceof Element) throw new Error('Expected an element, found: ' + element);
        this.elements = [...elements];
        this.elements.sort((a, b) => a.relevance - b.relevance);
    }

    parse(context) {
        const text = context.current_text;
        const outer = context.outer_match;
        for (let element of this.elements) {
            context.outer_match = outer;
            context.current_text = text;
            context.expect_start = true;
            const match = element.match(text, context);
            if (!match) continue;
        }
        context.outer_match = outer;
        context.current_text = text;
    }
}

class Context {
    original_text;
    current_text;
    language;
    parsing = true;
    outer_match = null;
    expect_start = false;
    position = 0;

}

class Highlighter {

    static default_languages = [];
    static register(language) {
        if (!language instanceof Language) throw new Error('Expected a language, found: ' + language);
        this.default_languages.push(language);
    }

    languages = [...Highlighter.default_languages];
    constructor(...languages) {
        if (languages.length > 0) this.languages = [...languages];
    }


    parse(text = '', language) {
        const context = new Context();
        context.language = language;
        context.original_text = text;
        context.current_text = text;
        while (context.parsing) {
            language.parse(context);
        }

    }

}

export {Highlighter, Language, Context, Element};
