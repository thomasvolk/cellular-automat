export interface Rule {
    calculateNewValue(cellValue: number, neighbourValues: Array<number>): number
}

export class EEFFRule implements Rule {
    static normalizeToOneOrZero(values: Array<number>): Array<number> {
        return values.map(v => {
            if (v > 0) return 1
            else return 0
        })
    }

    private el: number
    private eu: number
    private fl: number
    private fu: number

    constructor(el: number, eu: number, fl: number, fu: number) {
        this.el = el
        this.eu = eu
        this.fl = fl
        this.fu = fu
    }
    
    calculateNewValue(cellValue: number, neighbourValues: Array<number>): number {
        const normalizedValues = EEFFRule.normalizeToOneOrZero(neighbourValues)
        const livingNeighbours = normalizedValues.reduce((sum, current) => sum + current, 0)
        if(cellValue > 0 && (livingNeighbours < this.el || livingNeighbours > this.eu)) {
            return 0
        }
        else if(cellValue == 0 && (livingNeighbours >= this.fl && livingNeighbours <= this.fu)) {
            return 1
        }
        return cellValue
    }
}
