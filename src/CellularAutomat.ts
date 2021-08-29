export {Cell} from './Cell'
import {Universe} from './Universe'
export {Universe} from './Universe'
import {Rule} from './Rule'
export {Rule, EEFFRule, BSRule} from './Rule'
import {Configuration} from './Configuration'
export {Configuration} from './Configuration'
export {Format, JsonFormat, RleFormat} from './Format'


export class Runner {
    private universe: Universe
    private rule: Rule

    constructor(universe: Universe, rule: Rule) {
        this.universe = universe
        this.rule = rule
    }

    next() {
        this.universe.getCells().forEach(cell => {
            const newValue = this.rule.calculateNewValue(cell.getValue(), cell.getNeighbours().map(c => c.getValue()))
            cell.enterValue(newValue)
        })
        this.universe.getCells().forEach(c => c.apply())
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
        frameSize: number = 0,
        cellSize: number = 0
    ) {
        this.canvas = canvas
        if(cellSize > 0) {
            this.cellSize = cellSize
        }
        else {
            const canvasMinDimension = Math.min(this.canvas.height, this.canvas.width)
            const configMaxDimension = Math.max(config.universe.width, config.universe.height)
            if(configMaxDimension > canvasMinDimension) {
                this.cellSize = 1
                this.canvas.height = config.universe.height
                this.canvas.width = config.universe.width
            }
            else {
                this.cellSize = Math.round(canvasMinDimension / configMaxDimension)
            }
        }
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

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
    
    random() {
        this.clear()
        this.config.universe.reset()
        for (var c of this.config.universe.getCells()) {
            c.enterValue(Math.floor(Math.random() * Math.floor(2)))
            c.apply(true)
        }
    }

    start(delay_ms: number = 0) {
        if (!this.isRunning()) {
            const runner = new Runner(this.config.universe, this.config.rule)
            this.interval = setInterval(()=> { 
                this.draw()
                runner.next()
            }, delay_ms);
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