import { expect } from 'chai';
import {
    EEFFRule
} from "../src/CellularAutomat";
import {
    normalizeToOneOrZero
} from "../src/Rule";

describe('ConwayRule', () => {
    it('should normalizeToOneOrZero', () => {
        expect(
            normalizeToOneOrZero([5, 0.7, 0, 1, -1, 0]).join(",")
        ).to.equal("1,1,0,1,0,0")
    });
    it('should implement the rules correctly', () => {
        const testData = [
            {
                'cell': 1,
                'neighbours': [1, 1, 0, 0, 0, 0],
                'expected': 1
            },
            {
                'cell': 1,
                'neighbours': [1, 1, 0, 0, 0, 0, 0, 0, 0],
                'expected': 1
            },
            {
                'cell': 0,
                'neighbours': [1, 1, 0, 0, 0, 0, 0, 0, 0],
                'expected': 0
            },
            {
                'cell': 0,
                'neighbours': [1, 1, 1, 0, 0, 0, 0, 0, 0],
                'expected': 1
            },
            {
                'cell': 1,
                'neighbours': [1, 1, 1, 1, 0, 0, 0, 0, 0],
                'expected': 0
            },
            {
                'cell': 1,
                'neighbours': [1, 0, 0, 0, 0, 0, 0, 0, 0],
                'expected': 0
            }
        ]
        const conwayRule = new EEFFRule(2, 3, 3, 3)
        testData.forEach(testSet => {
            expect(
                conwayRule.calculateNewValue(testSet.cell, testSet.neighbours)
            ).to.equal(testSet.expected);
        });
    });
});