
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