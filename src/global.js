import Arduino from './classes/Arduino.js';
import Sensor from './classes/Sensor.js';
import UsbRoom from './classes/UsbRoom.js';
import LuftioRoom from './classes/LuftioRoom.js';
import rgb from './colors.js';

const deltams = 15; // inflation duration (ms) make it faster or slower

const arduinoDefinitions = [ // id must be a single character
    { id: '1', base: 'http://192.168.1.166' },
    { id: '2', base: 'http://192.168.1.150' },
    { id: '3', base: 'http://192.168.1.146' },
    { id: '4', base: 'http://192.168.1.149' },
    { id: '5', base: 'http://192.168.1.137' }
];

const usbSensorDefinitions = [
    { id: 'co2', scale: [400, rgb.Green, 500, rgb.Red] },
    // { id: 'relative-humidity', scale: [0, rgb.White, 100, rgb.Blue] },
    // { id: 'temperature', scale: [10, rgb.Blue, 15, rgb.Green, 20, rgb.Yellow, 30, rgb.Red] }
];

const usbRoomDefinitions = [
    { id: 'room-1-024-zone-3' },
    { id: 'room-1-024-zone-4' },
    { id: 'room-1-024-zone-5' },
    { id: 'room-1-024-zone-6' },
    { id: 'room-1-024-zone-7' },
    { id: 'room-1-024-zone-8' },
    { id: 'room-1-024-zone-9' },
    { id: 'room-1-024-zone-10' },
    { id: 'room-1-024-zone-11' },
    { id: 'room-1-024-zone-12' },
    { id: 'room-1-024-zone-13' },
    { id: 'room-1-024-zone-14' },
    { id: 'room-1-024-zone-15' },
    { id: 'room-1-024-zone-16' },
    { id: 'room-1-024-zone-17' },
];

const luftioSensorDefinitions = [
    { id: 'co2', scale: [400, rgb.Green, 450, rgb.Orange, 500, rgb.Red] },
   // { id: 'eco2', scale: [0, rgb.White, 100, rgb.Blue] },
    { id: 'hum', scale: [0, rgb.White, 100, rgb.Blue] },
    { id: 'temp', scale: [10, rgb.Blue, 15, rgb.Green, 20, rgb.Yellow, 30, rgb.Red] },
   // { id: 'pres', scale: [0, rgb.White, 100, rgb.Blue] },
   // { id: 'tvoc', scale: [10, rgb.Blue, 15, rgb.Green, 20, rgb.Yellow, 30, rgb.Red] }
];

const luftioRoomDefinitions = [
    { id: 'luftio-01', deviceGuid: 'e2f47bb0-2c28-11ec-af15-5fd753da8a14' },
    // { id: 'luftio-02' },
    // { id: 'luftio-03' },
    // { id: 'luftio-04' },
    // { id: 'luftio-05' }
];


const rooms = luftioRoomDefinitions.map(room => new LuftioRoom(room.id, room.deviceGuid));
const sensors = luftioSensorDefinitions.map(sensor => new Sensor(sensor.id, sensor.scale));
const arduinos = arduinoDefinitions.map(arduino => new Arduino(arduino.id, arduino.base));

export default { arduinos, rooms, sensors, deltams }