import { describe, it, expect, beforeEach } from 'vitest';
import { ReplaceInHTML, setSettings } from '../HTMLparser';
import { defaultSettings } from '../settings';

beforeEach(() => {
    // Reset to default settings before each test
    setSettings(defaultSettings);
});

describe('ReplaceInHTML', () => {
    describe('basic text replacement', () => {
        it('replaces a plain string in text content', () => {
            expect(ReplaceInHTML('<p>Hello World</p>', 'World', 'Earth')).toContain('Hello Earth');
        });

        it('replaces using a regex pattern', () => {
            expect(ReplaceInHTML('<p>foo bar</p>', /foo/g, 'baz')).toContain('baz bar');
        });

        it('replaces using a regex with a replacer function', () => {
            const result = ReplaceInHTML('<p>hello</p>', /hello/, (m: string) => m.toUpperCase());
            expect(result).toContain('HELLO');
        });

        it('returns the original HTML when no match is found', () => {
            const result = ReplaceInHTML('<p>Hello</p>', 'xyz', 'abc');
            expect(result).toContain('Hello');
            expect(result).not.toContain('abc');
        });
    });

    describe('tag attribute preservation', () => {
        it('does not replace text inside tag attributes', () => {
            const result = ReplaceInHTML('<a href="https://foo.com">foo</a>', 'foo', 'bar');
            expect(result).toContain('href="https://foo.com"');
            expect(result).toContain('bar');
        });

        it('replaces text content but preserves tag structure', () => {
            const html = '<span class="highlight">text</span>';
            const result = ReplaceInHTML(html, 'text', 'replaced');
            expect(result).toContain('class="highlight"');
            expect(result).toContain('replaced');
        });
    });

    describe('nested tags', () => {
        it('replaces text in nested tag content', () => {
            const html = '<div><p>Hello</p></div>';
            expect(ReplaceInHTML(html, 'Hello', 'Hi')).toContain('Hi');
        });

        it('replaces text across multiple sibling elements', () => {
            const html = '<div><p>cat</p><p>cat</p></div>';
            const result = ReplaceInHTML(html, /cat/g, 'dog');
            expect(result).not.toContain('cat');
        });
    });

    describe('void elements', () => {
        it('handles self-closing void elements without crashing', () => {
            const html = '<p>before<br />after</p>';
            const result = ReplaceInHTML(html, 'before', 'pre');
            expect(result).toContain('pre');
            expect(result).toContain('after');
        });
    });

    describe('elements with ignored content', () => {
        it('does not replace text inside script tags', () => {
            const html = '<p>hello</p><script>hello</script>';
            const result = ReplaceInHTML(html, 'hello', 'world');
            // Text in <p> should be replaced; content inside <script> should not
            expect(result).toContain('world');
            expect(result).toContain('hello</script>');
        });

        it('does not replace text inside style tags', () => {
            const html = '<p>hello</p><style>.hello{}</style>';
            const result = ReplaceInHTML(html, 'hello', 'world');
            expect(result).toContain('.hello{}');
        });
    });

    describe('inline elements', () => {
        it('treats inline elements as part of the same text block', () => {
            const html = '<p>hel<span>lo</span> world</p>';
            // "hello world" spans a text + inline + text; the span is inline so replacement
            // across the block should work if targeting just text nodes
            const result = ReplaceInHTML(html, 'world', 'earth');
            expect(result).toContain('earth');
            expect(result).not.toContain('world');
        });
    });

    describe('multiple replacements', () => {
        it('replaces all occurrences with a global regex', () => {
            const html = '<p>a a a</p>';
            const result = ReplaceInHTML(html, /a/g, 'b');
            expect(result).toContain('b b b');
        });

        it('replaces only first occurrence without global flag', () => {
            const html = '<p>a a a</p>';
            const result = ReplaceInHTML(html, /a/, 'b');
            expect(result).toContain('b a a');
        });
    });
});

describe('setSettings', () => {
    it('merges partial settings without overwriting unrelated fields', () => {
        setSettings({ output: { encode: false, transformDepricatedElements: true, xmlMode: false } });
        // ReplaceInHTML should still work after settings change
        const result = ReplaceInHTML('<p>hello</p>', 'hello', 'world');
        expect(result).toContain('world');
    });
});
