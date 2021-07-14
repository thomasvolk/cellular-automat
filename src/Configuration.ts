import {Universe} from './Universe'
import {Rule} from './Rule'


export class Configuration {
    universe: Universe
    rule: Rule

    constructor(universe: Universe, rule: Rule) {
        this.universe = universe
        this.rule = rule
    }
}