import { RegularExpressions } from "./regularExpressions";


export const extractAttributes = (tag: string): { [key: string]: string | undefined; } => {
    const attributeString = tag.match(RegularExpressions.AllAttributes);
    if (!attributeString)
        return {};
    const attributes: { [key: string]: string | undefined; } = {};
    Array.from(tag.matchAll(RegularExpressions.AttributeWithNoValue)).forEach(match => {
        if (match[1])
            attributes[match[1]] = undefined;
    });
    Array.from(tag.matchAll(RegularExpressions.AttributeWithNoQuotes)).forEach(match => {
        if (match[1])
            attributes[match[1]] = match[2];
    });
    Array.from(tag.matchAll(RegularExpressions.AttributeWithQuotes)).forEach(match => {
        if (match[1])
            attributes[match[1]] = match[2];
    });
    Array.from(tag.matchAll(RegularExpressions.AttributeWithSingleQuotes)).forEach(match => {
        if (match[1])
            attributes[match[1]] = match[2];
    });
    return attributes;

};
/**
 * Returns the innerHTML of a tag
 * @param tag
 * @returns string
 */
export const extractContentsOfTag = (tag: string): string => {
    return tag.split(RegularExpressions.Tag)[1] ?? '';
};
