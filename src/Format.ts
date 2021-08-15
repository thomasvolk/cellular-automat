import {Configuration} from './Configuration'
import { Rule, EEFFRule, BSRule } from './Rule';
import { Universe } from './Universe';
import { Cell } from './Cell';

export interface Format {
    decode(source: string): Configuration
    encode(config: Configuration): string
}

export class JsonFormat implements Format {
    private jsonToUniverse(obj: any): Universe {
        const u = new Universe(obj.width, obj.height);
        u.reset();
        (obj.cells as Array<any>).forEach((c) => {
            const cell = u.getCell(c.x, c.y)
            cell.enterValue(c.v)
            cell.apply(true)
        })
        return u
    }

    private jsonToRule(obj: any): Rule {
        if(obj.type = "EEFF") {
            return new EEFFRule(
                obj.el,
                obj.eu,
                obj.fl,
                obj.fu
            )
        }
        else if(obj.type = "BS") {
            return new BSRule(
                obj.born,
                obj.stay
            )
        }
        throw new Error(`unknown rule type: ${obj.type}`)
    }

    decode(source: string): Configuration {
        const root = JSON.parse(source)
        return new Configuration(this.jsonToUniverse(root.universe), this.jsonToRule(root.rule));
    }

    private ruleToJson(rule: Rule): any {
        const bsRule = BSRule.convert(rule)
        return {"type": "BS", "born": bsRule.born, "stay": bsRule.stay}
    }

    private cellsToJson(cells: Array<Cell>): Array<any> {
        return cells.filter((c) => c.getValue() > 0).map(c => {
            const o = {"x": c.getX(), "y": c.getY(), "v": c.getValue()}
            return o
        })
    }

    private universeToJson(universe: Universe): any {
        const cells = this.cellsToJson(universe.getCells())
        return {
            "type":"2D", 
            "endless":universe.endless, 
            "width":universe.width, 
            "height":universe.height,
            "cells": cells
        }
    }

    encode(config: Configuration): string {
        const rule = this.ruleToJson(config.rule)
        const universe = this.universeToJson(config.universe)
        const jsonConfig = {
            "universe": universe,
            "rule": rule
        }
        return JSON.stringify(jsonConfig)
    }    
}


export class RleFormat implements Format {

    private mapRow(row: Array<Cell>) {
        return row.map(c => {
            if(c.getValue() > 0) {
                return "o"
            }
            else {
                return "b"
            }
        }).join('')
    }
        
    decode(source: string): Configuration {
        throw new Error('Method not implemented.');
    }
    encode(config: Configuration): string {
        const rule = BSRule.convert(config.rule)
        const b = rule.born.join('')
        const s = rule.stay.join('')
        const rows = config.universe.getCellRows()
        const cells = rows.map(this.mapRow).join('$\n')
        return `#C RLE - https://www.conwaylife.com/wiki/Run_Length_Encoded
#C generated by cellular-automat - https://github.com/thomasvolk/cellular-automat
x = ${config.universe.width}, y = ${config.universe.height}, rule = B${b}/S${s}
${cells}!`
    }

}
