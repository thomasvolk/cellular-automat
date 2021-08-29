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
            return {"x": c.getX(), "y": c.getY(), "v": c.getValue()}
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
    private static COMPRESSED_ENTRY = /([0-9]+o|[0-9]+b)/

    public static uncompress(row: string): string {
        return row.split(RleFormat.COMPRESSED_ENTRY).map(e => {
            if(e.match(RleFormat.COMPRESSED_ENTRY)) {
                const c = e.split(/[0-9]+/)[1]
                const cnt = Number(e.split(/o|b/)[0])
                return [...Array(cnt)].map((_, i) => c)
            }
            else if(e.match(/o+|b+/)) {
                return e.split('')
            }
            else {
                return []
            }
        }).flat().filter( e => e == 'o' || e == 'b').join('')
    }

    public static compress(row: string): string {
        const sections = row.split(/(o+|b+)/).filter(s => s.match(/^b+$|^o+$/))
        const lastSection = sections[sections.length - 1]
        if(lastSection.match(/^b+$/)) {
            sections.pop()
        }
        function compressSection(section: string) {
            if(section.length > 1) {
                const item = section[0]
                return `${section.length}${item}`
            }
            return section
        }
        return sections.map(compressSection).join('')
    }

    public static hasAliveCells(row: Array<Cell>): boolean {
        return row.map((c) => c.getValue()).reduce((p, c) => p + c) > 0
    }

    public static cutDeadRowsTail(rows: Array<Array<Cell>>): Array<Array<Cell>> {
        const lastLivingCellRowIndex = rows.reduceRight(
            (acc, row, i) => acc == 0 && this.hasAliveCells(row) ? i : acc,
            0
        )
        return Array.from(rows).splice(0, lastLivingCellRowIndex + 1)
    }
    
    public static mapRow(row: Array<Cell>) {
        return row.map(c => c.getValue() > 0 ? 'o' : 'b').join('')
    }
    
    decode(source: string): Configuration {
        const lines = source.split(/\r?\n/)
        // get width and height
        const header_x = /x\s*=\s*([0-9]+)/
        const header_y = /y\s*=\s*([0-9]+)/
        const header_line = lines.find(l => l.match(header_x) && l.match(header_y))
        if(!header_line) {
            throw new Error('no header line found (x = m, y = n)');
        }
        const x = Number(header_line.match(header_x)![1])
        const y = Number(header_line.match(header_y)![1])
        // get rule
        const header_rule = /rule\s*=\s*B([0-9]+)\/S([0-9]+)/ 
        const default_rule = ['rule = B3/S23', '3', '23']
        const rule_match = header_line.match(header_rule) || default_rule
        const b = rule_match[1].split('').map(e => Number(e))
        const s = rule_match[2].split('').map(e => Number(e))
        const rule = new BSRule(b, s)
        // parse body lines
        const body_line = /^[0-9|o|b|\$|\!]+$/
        const body = lines.filter(l => l.match(body_line)).join('')
        const termination = body.indexOf('!')
        const rows = body.substr(0, termination).split('$').map(RleFormat.uncompress)
        // create universe
        const universe = new Universe(x, y)
        rows.forEach((row, ry) => {
            row.split('').forEach( (c, rx) => {
                if(c == 'o') {
                    universe.getCell(rx, ry).enterValue(1).apply()
                }
            } )
        })

        return new Configuration(universe, rule)
    }

    encode(config: Configuration): string {
        const rule = BSRule.convert(config.rule)
        const b = rule.born.join('')
        const s = rule.stay.join('')
        const rows = RleFormat.cutDeadRowsTail(config.universe.getCellRows())
        const cells = rows.map(RleFormat.mapRow).map(RleFormat.compress).join('$')
        return `#C RLE - https://www.conwaylife.com/wiki/Run_Length_Encoded
#C generated by cellular-automat - https://github.com/thomasvolk/cellular-automat
x = ${config.universe.width}, y = ${config.universe.height}, rule = B${b}/S${s}
${cells}!`
    }

}
