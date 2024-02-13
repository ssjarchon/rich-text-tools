import { depricatedElementsReplacementMap, elementsToIgnoreContentFor, inlineElements, specialTextElements, voidElements } from "./defaultElementRules";

export type Settings = {
    input:{
        /**
         * If true, the input will be treated as already encoded and valid html; otherwise, assume that text characters are not properly encoded.
         */
        encoded: boolean;
        /**
         * The list of elements that have no children and no closing tag.
         */
        voidElements: string[];
        /**
         * The list of elements that do not break up text.
         */
        inlineElements: string[];
        /**
         * The list of elements that should generally not be messed with as far as text manipulation goes.
         * These should still be checked for XSS and other security issues.
         */
        specialTextElements: string[];
        /**
         * The list of elements that should not have their content manipulated.
         */
        elementsToIgnoreContentFor: string[];
        /**
         * A map of depricated elements to their modern equivalents.
         */
        depricatedElementsReplacementMap: Map<string, string | ((entireTag: string) => string)>;
    },
    output:{
        /**
         * If true, the output text nodes will be encoded; otherwise, leave them alone.
         */
        encode: boolean;
        /**
         * if true, depricated HTML elements will be transformed into their modern equivalents where possible.
         */
        transformDepricatedElements: boolean;
        /**
         * If true, the output will be in XML mode, which is more strict about tag closing and self-closing tags.
         */
        xmlMode: boolean;
    }

}

export const defaultSettings = {
    input:{
        encoded: true,
        voidElements: voidElements,
        inlineElements: inlineElements,
        specialTextElements: specialTextElements,
        elementsToIgnoreContentFor: elementsToIgnoreContentFor,
        depricatedElementsReplacementMap: depricatedElementsReplacementMap,
    },
    output:{
        encode: true,
        transformDepricatedElements: true,
        xmlMode: false,
    }
} as const satisfies Settings;