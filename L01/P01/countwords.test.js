import test from "node:test";
import assert from "node:assert/strict";
import { countwords } from "./countwords.js";

test("counts words and sorts by frequency", () => {
    assert.deepEqual(
        countwords("The cat and the hat. The END, and the cat!"),
        [
            ["the", 4],
            ["and", 2],
            ["cat", 2],
            ["end", 1],
            ["hat", 1]
        ]
    );
});

test("handles case-insensitive matching and limits", () => {
    assert.deepEqual(
        countwords("Don't stop, don't quit", 1),
        [["don't", 2]]
    );
});

test("returns an empty array for empty input", () => {
    assert.deepEqual(countwords(""), []);
});

test("ignores punctuation and whitespace", () => {
    assert.deepEqual(countwords("  !!! \t\n ... "), []);
});

test("handles special object property names safely", () => {
    assert.deepEqual(
        countwords("constructor toString __proto__"),
        [
            ["__proto__", 1],
            ["constructor", 1],
            ["tostring", 1]
        ]
    );
});

test("handles apostrophes and hyphens", () => {
    assert.deepEqual(
        countwords("'hello' don't real-world"),
        [
            ["don't", 1],
            ["hello", 1],
            ["real", 1],
            ["world", 1]
        ]
    );
});

test("supports accented characters", () => {
    assert.deepEqual(
        countwords("Café cafe CAFÉ naïve"),
        [
            ["cafe", 1],
            ["café", 2],
            ["naïve", 1]
        ]
    );
});

test("rejects non-string input", () => {
    for (const input of [null, undefined, 42]) {
        assert.throws(
            () => countwords(input),
            {
                name: "TypeError",
                message: "text must be a string"
            }
        );
    }
});

test("rejects invalid limits", () => {
    for (const limit of [0, -1, 1.5, "2", null]) {
        assert.throws(
            () => countwords("hello world", limit),
            {
                name: "RangeError",
                message: "limit must be a positive integer"
            }
        );
    }
});

test("handles multiple spaces, tabs, and newlines", () => {
    assert.deepEqual(
        countwords("apple\tbanana\napple   orange"),
        [
            ["apple", 2],
            ["banana", 1],
            ["orange", 1]
        ]
    );
});

test("returns only the requested number of entries", () => {
    assert.deepEqual(
        countwords("banana apple cherry", 2),
        [
            ["apple", 1],
            ["banana", 1]
        ]
    );
});