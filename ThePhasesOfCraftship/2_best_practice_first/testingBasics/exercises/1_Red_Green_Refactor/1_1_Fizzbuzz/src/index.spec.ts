import { fizzbuzz } from "./fizzbuzz";
import { describe, expect, it } from '@jest/globals';
describe("fizzbuzz", () => {
    
    it("fizzbuzz should be defined",() => {
        expect(fizzbuzz).toBeDefined();
    })
    it('returns a string', () => {
        expect(typeof fizzbuzz(1)).toBe('string');
    })

    it('returns "Invalid input" when number is less than 1 and greater than 100', () => {
        expect(fizzbuzz(0)).toBe('Invalid input');
        expect(fizzbuzz(101)).toBe('Invalid input');
        expect(fizzbuzz(-1)).toBe('Invalid input');
    })

});
