import { extractContentsOfTag, extractAttributes } from "./extractors";
import { RegularExpressions } from "./regularExpressions";

/**
 * Elements that should not break text.
 */
export const textElements = [
    'span',
    'a',
    'abbr',
    'acronym',
    'b',
    'bdi',
    'bdo',
    'big',
    'cite',
    'code',
    'data',
    'dfn',
    'em',
    'i',
    'kbd',
    'label',
    'mark',
    'nobr',
    'q',
    'rp',
    'rt',
    'ruby',
    's',
    'samp',
    'small',
    'strong',
    'sub',
    'sup',
    'time',
    'tt',
    'u',
    'var',
    'wbr',

];

/**
 * Elements that have no children and no closing tag.
 */
export const voidElements = [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
];

/**
 * Elements that do not break up text. Most commonly listed first.
 */
export const inlineElements = [
    "span",
    "a",
    "b",
    "i",
    "u",
    
    "abbr",
    "acronym",
    
    "bdi",
    "bdo",
    "big",
    "cite",
    "code",
    "data",
    "dfn",
    "em",
    "kbd",
    "label",
    "mark",
    "nobr",
    "q",
    "rp",
    "rt",
    "ruby",
    "s",
    "samp",
    "small",
    "strong",
    "sub",
    "sup",
    "time",
    "tt",
    "var",
    "wbr",
];

/**
 * Elements that should generally not be messed with as far as text manipulation goes.
 * These should still be checked for XSS and other security issues.
 */
export const specialTextElements = [
    'ruby',
    'rp',
    'rt',
    'progress',
    'math',
    'pre',
    'code',
    'kbd',
    'cite',
    'blockquote',
    'acronym',
    'abbr',
    'address',
];
/**
 * Elements that should not have their content manipulated.
 */
export const elementsToIgnoreContentFor = [
    'script',
    'style',
    'template',
    'meter',
    'noscript',
    'noembed',
    'noframes',
    'samp',
    'var',
    'tt',
    'q',
    'bdo',
    'bdi',
];
export const depricatedElementsReplacementMap = new Map<string, string | ((entireTag: string) => string)>([
    ['acronym', 'abbr'],
    ['applet', 'object'],
    ['big', (fragment: string) => `<span style="font-size: larger;">${extractContentsOfTag(fragment)}</span>`],
    //['blink', 'style'],
    ['center', (fragment: string) => `<span style="text-align: center;">${extractContentsOfTag(fragment)}</span>`],
    ['dir', 'ul'],
    ['font', (fragment: string) => {
        const attributes = extractAttributes(fragment.match(RegularExpressions.Tag)?.[0] ?? '');
        return `<span style="font-family: ${attributes.face ?? 'inherit'}; font-size: ${attributes.size ?? 'inherit'}; color: ${attributes.color ?? 'inherit'};">${extractContentsOfTag(fragment)}</span>`;
    } ],
    ['marquee', 'span'],
    //['menu', 'ul'],
    ['nobr', (fragment: string) => `<span style="white-space: nowrap;">${extractContentsOfTag(fragment)}</span>`],
    ['plaintext', 'pre'],

    ['strike', 's'],
    ['tt', 'pre'],
    //['u', 'style'],
]);
