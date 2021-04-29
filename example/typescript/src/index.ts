import {
    Configuration,
    EEFFRule, 
    Universe,
    CellularAutomat
} from "cellular-js";


const config = new Configuration(new Universe(30, 30), new EEFFRule(2, 3, 3, 3), 100)
var ca = new CellularAutomat(document.getElementById('canvas') as HTMLCanvasElement, config, 'blue', '#aaa', 2)
ca.random()
ca.start()
