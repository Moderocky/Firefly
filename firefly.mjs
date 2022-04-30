class Node {
    toString() { return "ERROR"; }

    static ofText(string = '') {
        return new TextNode(string);
    }
    static ofHTML(string = '', tag = 'span', ...classes) {
        return new HTMNode(string, tag, ...classes);
    }
}

class TextNode extends Node {
    constructor(text) {
        super();
        this.text = text;
    }

    toString() {
        return '' + this.text || '';
    }
}

class HTMNode extends TextNode {
    constructor(text, tag, ...classes) {
        const element = document.createElement(tag);
        element.classList.add(...classes);
        element.innerText = text;
        super(element.outerHTML);
    }
}

class Element {

    type; regex;
    relevance = 0;
    elements = [];
    classes = [];
    tag = 'span';

    constructor(type, regex = /error/, ...elements) {
        this.type = type;
        this.regex = regex;
        this.classes.push('type-' + type);
        this.elements = [...elements];
    }

    setRelevance(relevance) {
        this.relevance = relevance;
        return this;
    }

    addClasses(...classes) {
        this.classes.push(...classes);
        return this;
    }

    addChildren(...elements) {
        this.elements.push(...elements);
        return this;
    }

    match(context) {
        const backup = {...context};
        backup.flags = [...context.flags];
        const text = context.current_text, outer = context.outer_match, start = context.expect_start, builder = context.current;
        const result = this.regex.exec(text);
        if (!result) return null;
        if (context.expect_start && result.index > 0) return null;
        const span = document.createElement('span');
        span.classList.add(...this.classes);
        const reset = () => {
            Object.assign(context, backup);
            context.current.removeChild(span);
            return null;
        }
        context.current.appendChild(span);
        context.current = span;
        context.current_text = text.substring(result.index, result.index + result[0].length);
        const children = [...this.elements];
        context.expect_start = false;
        let ledger = result.index, begin = result.index, end = result.index + result[0].length;
        if (result.length > 1) for (let i = 1; i < result.length; i++) {
            const element = children.shift();
            if (!element) throw new Error('Fewer sub-elements than groups in element: ' + this);
            context.outer_match = result;
            context.current_text = result[i];
            const result = element.match(context);
            context.current_text = text.substring(result.index + result[0].length);
            if (!result) return reset();
            if (result.index <= ledger) continue;
            const textNode = document.createTextNode(text.substring(ledger+1, result.index));
            context.current.insertBefore(textNode, context.current.lastChild);
            ledger = result.index + result[0].length;
        }
        let match = false;
        do {
            match = false;
            for (let element of children) {
                context.outer_match = result;
                context.current_text = text.substring(ledger, end);
                const childResult = element.match(context);
                if (!childResult) continue;
                const childBegin = ledger + childResult.index, childEnd = childBegin + childResult[0].length;
                context.current_text = text.substring(childEnd);
                const textNode = document.createTextNode(text.substring(ledger, childBegin));
                context.current.insertBefore(textNode, context.current.lastChild);
                ledger = childEnd;
                match = true;
            }
        } while (match);
        const textNode = document.createTextNode(text.substring(ledger, result.index + result[0].length));
        context.current.appendChild(textNode);
        context.expect_start = start;
        context.outer_match = outer;
        context.current = builder;
        context.current_text = text.substring(result.index + result[0].length);
        return result;
    };

}

class Language {
    elements = [];
    constructor(...elements) {
        for (let element of elements) if (!element instanceof Element) throw new Error('Expected an element, found: ' + element);
        this.elements = [...elements];
    }

    parse(context) {
        const text = context.current_text;
        const outer = context.outer_match;
        let ledger = 0;
        const weighting = new Map(), checker = [];
        for (let element of this.elements) {
            const result = element.regex.exec(text);
            if (result == null) continue;
            checker.push(result);
            weighting.set(result, element);
        }
        checker.sort((a, b) => a.index - b.index);
        if (checker.length > 0) {
            for (let check of checker) {
                const element = weighting.get(check);
                context.outer_match = outer;
                context.current_text = text;
                const match = element.match(context);
                if (!match) continue;
                const textNode = document.createTextNode(text.substring(0, match.index));
                context.current.insertBefore(textNode, context.current.lastChild);
                ledger = match.index + match[0].length;
                break;
            }
        }
        if (ledger === 0) {
            const textNode = document.createTextNode(text.substring(ledger));
            context.current.appendChild(textNode);
            context.current_text = '';
        } else context.current_text = text.substring(ledger);
        context.outer_match = outer;
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
    flags = [];
    builder = document.createElement('div');
    current = this.builder;

    hasFlag = (flag) => this.flags.includes(flag);
    addFlag = (flag) => this.flags.push(flag);
    removeFlag = (flag) => {
        const index = this.flags.lastIndexOf(flag);
        if (index < 0) return;
        this.flags = this.flags.splice(index, 1);
    }

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
            if (context.current_text == null || context.current_text.length < 1) context.parsing = false;
        }
        return context;
    }

}

export {Highlighter, Language, Context, Element, Node};
