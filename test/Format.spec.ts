import { expect, assert } from 'chai';
import {
    Configuration, 
    Format,
    Universe,
    EEFFRule
} from "../src/CellularAutomat";
import {
    JsonFormat
} from "../src/Format";


describe('JsonFormat', () => {
    it('should encode a configuration to a string', () => {
        const config = new Configuration(new Universe(2, 2), new EEFFRule(2, 3, 3, 3))
        config.universe.getCell(0, 0).enterValue(1).apply()
        config.universe.getCell(1, 1).enterValue(1).apply()
        const f = new JsonFormat()
        expect(f.encode(config)).to.equal('{"universe":{"type":"2D","endless":true,"width":2,"height":2,' +
        '"cells":[{"x":0,"y":0,"v":1},{"x":1,"y":0,"v":0},{"x":0,"y":1,"v":0},{"x":1,"y":1,"v":1}]},' +
        '"rule":{"type":"EEFF","el":2,"eu":3,"fl":3,"fu":3}}')
    });
});