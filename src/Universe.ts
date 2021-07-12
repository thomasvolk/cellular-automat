import {Cell} from './Cell'

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