import { expect } from 'chai';
import {
    normalizeToOneOrZero,
    BSRule,
    EEFFRule
} from "../src/Rule";

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

describe('utils', () => {
    it('should normalizeToOneOrZero', () => {
        expect(
            normalizeToOneOrZero([5, 0.7, 0, 1, -1, 0]).join(",")
        ).to.equal("1,1,0,1,0,0")
    });
})

describe('BSRule', () => {
    it('should implemented conway correctly', () => {
        const conwayBSRule = new BSRule([3], [2, 3])
        testData.forEach(testSet => {
            expect(
                conwayBSRule.calculateNewValue(testSet.cell, testSet.neighbours)
            ).to.equal(testSet.expected);
        });
    });
});

describe('BSRule.convert', () => {
    it('should convert from EEFFRule to BSRule', () => {
        const conwayEEFFRule = new EEFFRule(2, 3, 3, 3)
        const conwayBSRule = BSRule.convert(conwayEEFFRule)
        expect(conwayBSRule.born).to.eql([3] as Array<number>)
        expect(conwayBSRule.stay).to.eql([2, 3])

        testData.forEach(testSet => {
            expect(
                conwayBSRule.calculateNewValue(testSet.cell, testSet.neighbours)
            ).to.equal(testSet.expected);
        });
    })

    it('should return the same for BSRule as input', () => {
        const conwayBSRule = new BSRule([3], [2, 3])
        const conwayBSRuleSameObj = BSRule.convert(conwayBSRule)
        expect(conwayBSRule).to.equal(conwayBSRuleSameObj)
        expect(conwayBSRule.born).to.eql([3] as Array<number>)
        expect(conwayBSRule.stay).to.eql([2, 3])

        testData.forEach(testSet => {
            expect(
                conwayBSRuleSameObj.calculateNewValue(testSet.cell, testSet.neighbours)
            ).to.equal(testSet.expected);
        });
    })
});

describe('EEFFRule', () => {
    it('should implemented conway correctly', () => {
        const conwayEEFFRule = new EEFFRule(2, 3, 3, 3)
        testData.forEach(testSet => {
            expect(
                conwayEEFFRule.calculateNewValue(testSet.cell, testSet.neighbours)
            ).to.equal(testSet.expected);
        });
    });
});
