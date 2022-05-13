import Arduino from './classes/Arduino.js';
import Sensor from './classes/Sensor.js';
import Room from './classes/Room.js';
import rgb from './colors.js';

const deltams = 20; // inflation duration (ms) make it faster or slower

const arduinoDefinitions = [
    { id: 'A', base: 'http://192.168.1.166' },
    { id: 'B', base: 'http://10.20.2.22:3000' },
    { id: 'C', base: 'http://10.20.2.22:3000' },
    { id: 'D', base: 'http://10.20.2.22:3000' },    
];

const sensorDefinitions = [
    { id: 'co2', scale: [400, rgb.Green, 500, rgb.Red] },
    { id: 'relative-humidity', scale: [0, rgb.White, 100, rgb.Blue] },
    { id: 'temperature', scale: [10, rgb.Blue, 15, rgb.Green, 20, rgb.Yellow, 30, rgb.Red] }
];

const roomDefinitions = [
    { id: 'room-1-024-zone-3' },
    { id: 'room-1-024-zone-4' },
    { id: 'room-1-024-zone-5' },
 // { id: 'room-1-024-zone-6' },
 // { id: 'room-1-024-zone-7' },
 // { id: 'room-1-024-zone-8' },
 // { id: 'room-1-024-zone-9' },
 // { id: 'room-1-024-zone-10' },
 // { id: 'room-1-024-zone-11' },
 // { id: 'room-1-024-zone-12' },
 // { id: 'room-1-024-zone-13' },
 // { id: 'room-1-024-zone-14' },
 // { id: 'room-1-024-zone-15' },
 // { id: 'room-1-024-zone-16' },
 // { id: 'room-1-024-zone-17' },
];

const rooms = roomDefinitions.map(room => new Room(room.id));
const sensors = sensorDefinitions.map(sensor => new Sensor(sensor.id, sensor.scale));
const arduinos = arduinoDefinitions.map(arduino => new Arduino(arduino.id, arduino.base));

export default { arduinos, rooms, sensors, deltams }