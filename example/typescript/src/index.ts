import {
    Configuration,
    EEFFRule, 
    Universe,
    CellularAutomat
} from "cellular-automat";


const config = new Configuration(new Universe(40, 30), new EEFFRule(2, 3, 3, 3), 100)
var ca = new CellularAutomat(document.getElementById('canvas') as HTMLCanvasElement, config, 'blue', '#aaa', 2, 20)
ca.random()
ca.start()
