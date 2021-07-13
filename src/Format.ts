import {Configuration} from './Configuration'
import { Rule, EEFFRule } from './Rule';
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
        return new EEFFRule(
            obj.el,
            obj.eu,
            obj.fl,
            obj.fu
        )
    }

    decode(source: string): Configuration {
        const root = JSON.parse(source)
        return new Configuration(this.jsonToUniverse(root.universe), this.jsonToRule(root.rule));
    }

    private ruleToJson(rule: Rule): any {
        if(rule instanceof EEFFRule) {
            const r = rule as EEFFRule
            return {"type":"EEFF", "el":r.el, "eu":r.eu, "fl":r.fl, "fu":r.fu}
        }
        return {};
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

