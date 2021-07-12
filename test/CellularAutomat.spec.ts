import { expect, assert } from 'chai';
import {
    Universe, 
    EEFFRule
} from "../src/CellularAutomat";

describe('Universe2D', () => {
    it('should initialize properly', () => {
        const u = new Universe(20, 20);
        expect(u.width).to.equal(20)
        expect(u.height).to.equal(20)
        expect(u.getCells().length).to.equal(400)
    });
    it('should calculate the neighbours of a cell correctly', () => { 
        const u = new Universe(20, 20);
        
        const testData = 
        [
            {
                "cell": [10, 10],
                "neighbours": [
                    [0, 9, 9],
                    [1, 10, 9],
                    [2, 11, 9],
                    [3, 9, 10],
                    [4, 11, 10],
                    [5, 9, 11],
                    [6, 10, 11],
                    [7, 11, 11]
                ]
            },
            {
                "cell": [0, 0],
                "neighbours": [
                    [0, 19, 19],
                    [1, 0, 19],
                    [2, 1, 19],
                    [3, 19, 0],
                    [4, 1, 0],
                    [5, 19, 1],
                    [6, 0, 1],
                    [7, 1, 1]
                ]
            }
        ]
        
        testData.forEach(testSet => {
            const [x, y] = testSet.cell
            const cell = u.getCell(x, y)
            const neighbours = cell.getNeighbours()
            expect(neighbours.length).to.equal(8)
            testSet.neighbours.forEach(([number, nx, ny]) => {
                const n = neighbours[number]
                expect(n.getX(), `cell(x=${x}, y=${y}) number=${number} nx=${nx}`).to.equal(nx)
                expect(n.getY(), `cell(x=${x}, y=${y}) number=${number} ny=${ny}`).to.equal(ny)
            });
        });
    });
});

describe('cycle function', () => {
    it('should calculate correctly', () => {
        const testData = [
            [5, 10, 5],
            [10, 10, 0],
            [14, 10, 4],
            [0, 10, 0],
            [0, 1, 0],
            [1, 1, 0],
            [-1, 10, 9],
            [-8, 10, 2],
            [-12, 10, 8]
        ]
        testData.forEach(([value, max, expected]) => {
            expect(Universe.cycle(value, max), 
              `cycle(${value}, ${max})`).to.equal(expected) 
        });
        
        assert(isNaN(Universe.cycle(0,   0)), "cycle(0,   0) = NaN")
    });
});

describe('ConwayAlgorithm', () => {
    it('should normalizeToOneOrZero', () => {
        expect(
            EEFFRule.normalizeToOneOrZero([5, 0.7, 0, 1, -1, 0]).join(",")
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