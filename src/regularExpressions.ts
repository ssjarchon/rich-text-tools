
export const RegularExpressions = {
    SelfClosingTag: /^<[^>]*[/]{1}[\s]*>$/gi,
    ClosingTag: /^<[\s]*[/][\s]*/gi,
    Tag: /^<[^>]*>$/gi,
    TagName: /^<[\s/]*([\w]+)/gi,
    AttributeWithNoQuotes: /([\w-]+)[\s]*=[\s]*([^"\s>]*)/gi,
    AttributeWithQuotes: /([\w-]+)[\s]*=[\s]*"([^"]*)"/gi,
    AttributeWithSingleQuotes: /([\w-]+)[\s]*=[\s]*'([^']*)'/gi,
    AttributeWithNoValue: /[\s]*([\w-]+)[\s>]/gi,
    AllAttributes: /^<[\w_]+\s*([\s\S]*)>$/gi,
};
