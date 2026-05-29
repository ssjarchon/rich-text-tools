import { describe, it, expect } from 'vitest';
import { RegularExpressions } from '../regularExpressions';

describe('RegularExpressions.SelfClosingTag', () => {
    it('matches a simple self-closing tag', () => {
        expect('<br />').toMatch(RegularExpressions.SelfClosingTag);
    });

    it('matches a self-closing tag with attributes', () => {
        expect('<img src="foo.png" />').toMatch(RegularExpressions.SelfClosingTag);
    });

    it('does not match an opening tag', () => {
        RegularExpressions.SelfClosingTag.lastIndex = 0;
        expect(RegularExpressions.SelfClosingTag.test('<div>')).toBe(false);
    });

    it('does not match a closing tag', () => {
        RegularExpressions.SelfClosingTag.lastIndex = 0;
        expect(RegularExpressions.SelfClosingTag.test('</div>')).toBe(false);
    });
});

describe('RegularExpressions.ClosingTag', () => {
    it('matches a standard closing tag', () => {
        RegularExpressions.ClosingTag.lastIndex = 0;
        expect(RegularExpressions.ClosingTag.test('</div>')).toBe(true);
    });

    it('matches a closing tag with extra spaces', () => {
        RegularExpressions.ClosingTag.lastIndex = 0;
        expect(RegularExpressions.ClosingTag.test('< / span>')).toBe(true);
    });

    it('does not match an opening tag', () => {
        RegularExpressions.ClosingTag.lastIndex = 0;
        expect(RegularExpressions.ClosingTag.test('<div>')).toBe(false);
    });
});

describe('RegularExpressions.TagName', () => {
    it('extracts the tag name from an opening tag', () => {
        RegularExpressions.TagName.lastIndex = 0;
        const match = '<div class="foo">'.match(RegularExpressions.TagName);
        expect(match?.[1]).toBe('div');
    });

    it('extracts the tag name from a closing tag', () => {
        RegularExpressions.TagName.lastIndex = 0;
        const match = '</span>'.match(RegularExpressions.TagName);
        expect(match?.[1]).toBe('span');
    });

    it('returns null for plain text', () => {
        RegularExpressions.TagName.lastIndex = 0;
        expect('hello world'.match(RegularExpressions.TagName)).toBeNull();
    });
});

describe('RegularExpressions.AttributeWithQuotes', () => {
    it('matches an attribute with double quotes', () => {
        RegularExpressions.AttributeWithQuotes.lastIndex = 0;
        const match = [...'<a href="https://example.com">'.matchAll(RegularExpressions.AttributeWithQuotes)];
        expect(match[0]?.[1]).toBe('href');
        expect(match[0]?.[2]).toBe('https://example.com');
    });
});

describe('RegularExpressions.AttributeWithSingleQuotes', () => {
    it('matches an attribute with single quotes', () => {
        RegularExpressions.AttributeWithSingleQuotes.lastIndex = 0;
        const match = [..."<img src='photo.jpg'>".matchAll(RegularExpressions.AttributeWithSingleQuotes)];
        expect(match[0]?.[1]).toBe('src');
        expect(match[0]?.[2]).toBe('photo.jpg');
    });
});

describe('RegularExpressions.AttributeWithNoQuotes', () => {
    it('matches an unquoted attribute value', () => {
        RegularExpressions.AttributeWithNoQuotes.lastIndex = 0;
        const match = [...'<input type=text>'.matchAll(RegularExpressions.AttributeWithNoQuotes)];
        expect(match[0]?.[1]).toBe('type');
        expect(match[0]?.[2]).toBe('text');
    });
});
