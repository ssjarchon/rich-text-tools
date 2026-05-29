import { describe, it, expect } from 'vitest';
import { extractAttributes, extractContentsOfTag } from '../extractors';

describe('extractAttributes', () => {
    it('returns an empty object for a tag with no attributes', () => {
        expect(extractAttributes('<div>')).toEqual({});
    });

    it('parses double-quoted attributes', () => {
        expect(extractAttributes('<a href="https://example.com" target="_blank">')).toMatchObject({
            href: 'https://example.com',
            target: '_blank',
        });
    });

    it('parses single-quoted attributes', () => {
        expect(extractAttributes("<img src='photo.jpg' alt='photo'>")).toMatchObject({
            src: 'photo.jpg',
            alt: 'photo',
        });
    });

    it('parses unquoted attributes', () => {
        expect(extractAttributes('<input type=text>')).toMatchObject({
            type: 'text',
        });
    });

    it('parses boolean (value-less) attributes as undefined', () => {
        const attrs = extractAttributes('<input disabled>');
        expect(attrs).toHaveProperty('disabled');
        expect(attrs['disabled']).toBeUndefined();
    });

    it('parses a mix of attribute types', () => {
        const attrs = extractAttributes('<input type="checkbox" checked value=yes>');
        expect(attrs['type']).toBe('checkbox');
        expect(attrs).toHaveProperty('checked');
        expect(attrs['value']).toBe('yes');
    });

    it('returns an empty object for a self-closing tag with no attributes', () => {
        expect(extractAttributes('<br />')).toEqual({});
    });
});

describe('extractContentsOfTag', () => {
    it('returns the innerHTML of a simple tag', () => {
        expect(extractContentsOfTag('<div>Hello</div>')).toBe('Hello');
    });

    it('returns the text between the opening tag and the next tag when content is nested', () => {
        // The function splits by tag boundaries, so for nested HTML it returns
        // the text between the first opening tag and the next tag (empty here).
        expect(extractContentsOfTag('<p><strong>bold</strong></p>')).toBe('');
    });

    it('returns an empty string when the tag has no children', () => {
        expect(extractContentsOfTag('<br />')).toBe('');
    });

    it('returns the innerHTML of a tag with attributes', () => {
        expect(extractContentsOfTag('<span class="foo">text</span>')).toBe('text');
    });
});
