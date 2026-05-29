
export const RegularExpressions = {
    SelfClosingTag: /^<[^>]*[/]{1}[\s]*>$/gi,
    ClosingTag: /^<[\s]*[/][\s]*/gi,
    /** Matches a single HTML tag. Use TagSplit to split an HTML string into tag and text segments. */
    Tag: /<[^<>]*>/gi,
    /** Splits an HTML string into alternating text and tag segments (tags are captured and included). */
    TagSplit: /(<[^<>]*>)/gi,
    TagName: /^<[\s/]*([\w]+)/i,
    AttributeWithNoQuotes: /([\w][\w-]*)[\s]*=[\s]*([^"\s>]*)/gi,
    AttributeWithQuotes: /([\w][\w-]*)[\s]*=[\s]*"([^"]*)"/gi,
    AttributeWithSingleQuotes: /([\w][\w-]*)[\s]*=[\s]*'([^']*)'/gi,
    AttributeWithNoValue: /[\s]*([\w][\w-]*)[\s>]/gi,
    AllAttributes: /^<[\w_]+\s*([\s\S]*)>$/i,
};
