import { describe, it, expect } from 'vitest';
import { antiRecursiveReferenceGenerator } from '../antiRecursiveReferenceGenerator';

describe('antiRecursiveReferenceGenerator', () => {
    it('returns true the first time an object is seen', () => {
        const check = antiRecursiveReferenceGenerator();
        const obj = {};
        expect(check(obj)).toBe(true);
    });

    it('returns false the second time the same object is seen', () => {
        const check = antiRecursiveReferenceGenerator();
        const obj = {};
        check(obj);
        expect(check(obj)).toBe(false);
    });

    it('tracks different objects independently', () => {
        const check = antiRecursiveReferenceGenerator();
        const a = {};
        const b = {};
        expect(check(a)).toBe(true);
        expect(check(b)).toBe(true);
        expect(check(a)).toBe(false);
        expect(check(b)).toBe(false);
    });

    it('each generator instance has its own independent state', () => {
        const check1 = antiRecursiveReferenceGenerator();
        const check2 = antiRecursiveReferenceGenerator();
        const obj = {};
        check1(obj);
        // check2 has not seen obj yet
        expect(check2(obj)).toBe(true);
        expect(check1(obj)).toBe(false);
    });

    it('works with non-plain objects like arrays', () => {
        const check = antiRecursiveReferenceGenerator();
        const arr: never[] = [];
        expect(check(arr)).toBe(true);
        expect(check(arr)).toBe(false);
    });
});
