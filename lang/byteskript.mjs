import {Language, Highlighter} from "../firefly.mjs";

class ByteSkript extends Language {

    constructor() {
        super();
    }

}

Highlighter.register(new ByteSkript());
