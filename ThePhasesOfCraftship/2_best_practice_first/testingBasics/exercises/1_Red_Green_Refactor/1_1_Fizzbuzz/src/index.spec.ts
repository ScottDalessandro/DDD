import { fizzbuzz } from "./fizzbuzz";
import { describe, expect, it } from '@jest/globals';
describe("fizzbuzz", () => {
    
    it("fizzbuzz should be defined",() => {
        expect(fizzbuzz).toBeDefined();
    })
    it('returns a string', () => {
        expect(fizzbuzz(1)).toBeInstanceOf(String);
    })
});
