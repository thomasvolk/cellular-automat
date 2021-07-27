export interface Rule {
    calculateNewValue(cellValue: number, neighbourValues: Array<number>): number
}

export function normalizeToOneOrZero(values: Array<number>): Array<number> {
    return values.map(v => {
        if (v > 0) return 1
        else return 0
    })
}

function countLivingNeighbours(neighbourValues: Array<number>) {
    const normalizedValues = normalizeToOneOrZero(neighbourValues)
    return normalizedValues.reduce((sum, current) => sum + current, 0)
}

export class BSRule implements Rule {
    readonly born: Array<number>
    readonly stayAlive: Array<number>

    constructor(born: Array<number>, stayAlive: Array<number>) {
        this.born = born
        this.stayAlive = stayAlive
    }

    calculateNewValue(cellValue: number, neighbourValues: number[]): number {
        const livingNeighbours = countLivingNeighbours(neighbourValues)
        if(cellValue > 0 && this.stayAlive.indexOf(livingNeighbours) >= 0) {
            return cellValue
        }
        else if(cellValue == 0 && this.born.indexOf(livingNeighbours) >= 0) {
            return 1
        }
        return 0
    }

    static convert(rule: Rule): BSRule {
        if(rule instanceof EEFFRule) {
            const eeffRule = rule as EEFFRule
            var born = Array<number>();
            for(var i = eeffRule.fl; i <= eeffRule.fu; i++) {
                born.push(i)
            }
            var stay = Array<number>();
            for(var i = eeffRule.el; i <= eeffRule.eu; i++) {
                stay.push(i)
            }
            return new BSRule(born, stay)
        }
        else if(rule instanceof BSRule) {
            return rule as BSRule
        }
        throw new Error(`can not convert rule: ${rule}`)
    }
}

export class EEFFRule implements Rule {
    readonly el: number
    readonly eu: number
    readonly fl: number
    readonly fu: number

    constructor(el: number, eu: number, fl: number, fu: number) {
        this.el = el
        this.eu = eu
        this.fl = fl
        this.fu = fu
    }
    
    calculateNewValue(cellValue: number, neighbourValues: Array<number>): number {
        const livingNeighbours = countLivingNeighbours(neighbourValues)
        if(cellValue > 0 && (livingNeighbours < this.el || livingNeighbours > this.eu)) {
            return 0
        }
        else if(cellValue == 0 && (livingNeighbours >= this.fl && livingNeighbours <= this.fu)) {
            return 1
        }
        return cellValue
    }
}
