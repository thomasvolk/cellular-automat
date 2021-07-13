import {Configuration} from './Configuration'
import { Rule, EEFFRule } from './Rule';
import { Universe } from './Universe';
import { Cell } from './Cell';

export interface Format {
    decode(source: string): Configuration
    encode(config: Configuration): string
}

export class JsonFormat implements Format {
    decode(source: string): Configuration {
        return new Configuration(new Universe(0, 0), new EEFFRule(0,0,0,0));
    }

    private ruleToJson(rule: Rule): Object {
        if(rule instanceof EEFFRule) {
            const r = rule as EEFFRule
            return {"type":"EEFF", "el":r.el, "eu":r.eu, "fl":r.fl, "fu":r.fu}
        }
        return {};
    }

    private cellsToJson(cells: Array<Cell>): Array<Object> {
        return cells.map(c => {
            const o = {"x": c.getX(), "y": c.getY(), "v": c.getValue()}
            return o
        })
    }

    private universeToJson(universe: Universe): Object {
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

