interface Serializable {
    toObject(): Object
}

export class Cell {
    private value: number
    private newValue: number
    private hasChanged: boolean
    private neighbours: Array<Cell>
    private x: number
    private y: number
    
    constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.value = 0
        this.newValue = 0
        this.hasChanged = false
        this.neighbours = new Array<Cell>()
    }

    toObject(): Object {
        return { 
            x: this.x,
            y: this.y,
            v: this.getValue()
         }
    }
    
    getX(): number {
        return this.x
    }
    
    getY(): number {
        return this.y
    }

    getValue(): number {
        return this.value
    }

    setNeighbours(n: Array<Cell>) {
        this.neighbours = n
    }

    getNeighbours(): Array<Cell> {
        return this.neighbours
    }

    enterValue(v: number): Cell {
        this.newValue = v
        return this
    }

    apply(touch: boolean = false) {
        if(this.newValue != this.value) {
            this.value = this.newValue 
            this.hasChanged = true
        }
        else {
            this.hasChanged = touch            
        }
    }

    reset() {
        this.value = 0
        this.newValue = 0
        this.hasChanged = true
    }

    getHasChanged() {
        return this.hasChanged
    }
}

export class Universe {
    private cells: Array<Cell>
    width: number
    height: number
    endless: boolean
    
    constructor(width: number, height: number, endless: boolean = true) {
        this.width = width
        this.height = height
        this.endless = endless
        this.cells = []
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                this.cells.push(new Cell(x, y))
            }
        }
        for (let cell of this.cells) {
            cell.setNeighbours(this.getNeighbours(cell))
        }
    }

    toObject(): Object {
        const cells = this.cells.filter((c) => c.getValue() > 0).map((c) => c.toObject())
        return {
            type: "2D",
            endless: this.endless,
            width: this.width,
            height: this.height,
            cells: cells
        }
    }
    
    static fromObject(obj: any): Universe {
        const u = new Universe(obj.width, obj.height);
        u.reset();
        (obj.cells as Array<any>).forEach((c) => {
            const cell = u.getCell(c.x, c.y)
            cell.enterValue(c.v)
            cell.apply(true)
        })
        return u
    }
    
    static cycle(v: number, max: number): number {
        if (v < 0) {
            return max + (v % max)
        }
        if (v < max) {
            return v
        }
        return v % max
    }

    private isInside(x: number, y: number): boolean {
        return this.endless || x > 0 && x < this.width && y > 0 && y < this.height
    }

    getCell(x: number, y: number): Cell {
        const cx = Universe.cycle(x, this.width)
        const cy = Universe.cycle(y, this.height)
        const i = cx + cy * this.width
        return this.cells[i]
    }

    getCells(): Array<Cell> {
        return this.cells
    }

    private getNeighbours(cell: Cell): Array<Cell> {
        const x = cell.getX()
        const y = cell.getY()
        const neighbours = new Array<Cell>()
        for(var ny = -1; ny < 2; ny++) {
            for(var nx = -1; nx < 2; nx++) {
                if(!(nx == 0 && ny == 0) && this.isInside(nx, ny)) {
                    neighbours.push(this.getCell(x + nx, y + ny))
                }
            }
        }
        return neighbours
    }

    getValue(): number {
        return this.getCells().reduce((sum, cell) => sum + cell.getValue(), 0)
    }

    reset() {
        this.getCells().forEach(c => c.reset())
    }
}

export interface Rule extends Serializable {
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
    toObject(): Object {
        return {
            type: "EEFF",
            el: this.el,
            eu: this.eu,
            fl: this.fl,
            fu: this.fu
        }
    }
    static fromObject(obj: any): EEFFRule {
        return new EEFFRule(
            obj.el,
            obj.eu,
            obj.fl,
            obj.fu
        )
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

export class EvolutionAlgorithm {
    private universe: Universe
    private rule: Rule

    constructor(universe: Universe, rule: Rule) {
        this.universe = universe
        this.rule = rule
    }

    iterate() {
        this.universe.getCells().forEach(cell => {
            const newValue = this.rule.calculateNewValue(cell.getValue(), cell.getNeighbours().map(c => c.getValue()))
            cell.enterValue(newValue)
        })
        this.universe.getCells().forEach(c => c.apply())
    }
}

export class Configuration {
    universe: Universe
    rule: Rule
    delay_ms: number

    constructor(universe: Universe, rule: Rule, delay_ms: number) {
        this.universe = universe
        this.rule = rule
        this.delay_ms = delay_ms
    }

    toObject(): Object {
        return {
            universe: this.universe.toObject(),
            rule: this.rule.toObject(),
            delay_ms: this.delay_ms
        }
    }

    newAlgorithm(): EvolutionAlgorithm {
        return new EvolutionAlgorithm(this.universe, this.rule)
    }

    static fromObject(cfg: any): Configuration {
        return new Configuration(
            Universe.fromObject(cfg.universe),
            EEFFRule.fromObject(cfg.rule),
            cfg.delay_ms
        )
    }
}


export class CellularAutomat{
    private canvas: HTMLCanvasElement
    private context: CanvasRenderingContext2D
    private cellSize: number
    private interval: any
    private config: Configuration
    private deadColor: string
    private aliveColor: string
    private frameSize: number
    private cellBoxSize: number

    constructor(
        canvas: HTMLCanvasElement, 
        config: Configuration, 
        aliveColor: string = 'black',
        deadColor: string = 'white',
        frameSize: number = 0
    ) {
        this.canvas = canvas
        this.cellSize = Math.round(
            Math.min(this.canvas.height, this.canvas.width) / Math.max(config.universe.width, config.universe.height))
        if(this.cellSize > (frameSize * 3) ) {
            this.cellBoxSize = this.cellSize - (frameSize * 2)
            this.frameSize = frameSize
        }
        else {
            this.cellBoxSize = this.cellSize
            this.frameSize = 0
        }
        this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D
        this.interval = null
        this.config = config
        this.aliveColor = aliveColor
        this.deadColor = deadColor
    }

    draw() {
        for (var c of this.config.universe.getCells()) {
            if(c.getHasChanged()) {
                if (c.getValue() > 0) {
                    this.context.fillStyle = this.aliveColor
                }
                else {
                    this.context.fillStyle = this.deadColor
                }
            
                const x = c.getX() * this.cellSize + this.frameSize
                const y = c.getY() * this.cellSize + this.frameSize
                this.context.fillRect(x, y, this.cellBoxSize, this.cellBoxSize)
            }
        }
    }
    
    random() {
        this.config.universe.reset()
        for (var c of this.config.universe.getCells()) {
            c.enterValue(Math.floor(Math.random() * Math.floor(2)))
            c.apply(true)
        }
    }

    start() {
        if (!this.isRunning()) {
            const algorithm = this.config.newAlgorithm()
            this.interval = setInterval(()=> { 
                this.draw()
                algorithm.iterate()
            }, this.config.delay_ms);
        }
    }

    stop() {
        if (this.isRunning()) {
            clearInterval(this.interval)
            this.interval = null
        }
    }

    isRunning(): boolean {
        return this.interval != null
    }
}