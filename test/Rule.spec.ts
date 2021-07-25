import { expect } from 'chai';
import {
    normalizeToOneOrZero,
    BSRule,
    EEFFRule
} from "../src/Rule";

describe('utils', () => {
    it('should normalizeToOneOrZero', () => {
        expect(
            normalizeToOneOrZero([5, 0.7, 0, 1, -1, 0]).join(",")
        ).to.equal("1,1,0,1,0,0")
    });
})

describe('ConwayRule', () => {
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

    it('should implemented by the EEFFRule correctly', () => {
        const conwayEEFFRule = new EEFFRule(2, 3, 3, 3)
        testData.forEach(testSet => {
            expect(
                conwayEEFFRule.calculateNewValue(testSet.cell, testSet.neighbours)
            ).to.equal(testSet.expected);
        });
    });

    it('should implemented by the BSRule correctly', () => {
        const conwayBSRule = new BSRule([3], [2, 3])
        testData.forEach(testSet => {
            expect(
                conwayBSRule.calculateNewValue(testSet.cell, testSet.neighbours)
            ).to.equal(testSet.expected);
        });
    });

    it('should be converted to BSRule correctly', () => {
        const conwayEEFFRule = new EEFFRule(2, 3, 3, 3)
        const conwayBSRule = conwayEEFFRule.toBSRule()
        expect(conwayBSRule.born).to.eql([3] as Array<number>)
        expect(conwayBSRule.stayAlive).to.eql([2, 3])

        testData.forEach(testSet => {
            expect(
                conwayBSRule.calculateNewValue(testSet.cell, testSet.neighbours)
            ).to.equal(testSet.expected);
        });
    })
});
