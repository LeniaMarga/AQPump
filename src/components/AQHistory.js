import React, { Component } from 'react';
import { Scatter, ScatterChart, XAxis, YAxis } from 'recharts';
import global from '../global.js';
const { arduinos, sensors, rooms } = global;

class AQHistory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            order: []
        };
    }

    selectSource(event) { 
        let value = event.target.value;
        let [arduinoIndex, roomIndex, sensorIndex] = value.split('/');
        let arduino = arduinos[arduinoIndex];
        let room = rooms[roomIndex];
        let sensor = sensors[sensorIndex];
        let state = {};
        state[arduino.key] = { room: room, sensor: sensor };
        this.setState(state);
    }

    getHistoryData(arduino) { 
        let entry = this.state[arduino.key];
        if (!entry) return this.props.getHistoryData(rooms[0], sensors[0]);
        return this.props.getHistoryData(entry.room, entry.sensor);
    }  
    
    handleOrderChange = (event, index) => {
        let state = this.state.order;
        state[index] = event.target.value;
        this.setState({
            order: [...this.state.order]
        })
    }

    render() {
        return (
            <>
                <table>
                    <thead><tr><th>arduino</th><th>source</th><th>history</th><th>order</th></tr></thead>
                    <tbody>
                        {arduinos.map((arduino, index) => (
                            <tr key={arduino.key}>
                                <th>{arduino.label}</th>
                                <td>
                                    <select onChange={(event) => this.selectSource(event)}>
                                        {sensors.map((sensor, sensorIndex) => (
                                            <optgroup key={sensor.key} label={sensor.id}>
                                                {rooms.map((room, roomIndex) => (
                                                    <option key={room.key} value={`${index}/${roomIndex}/${sensorIndex}`}>{room.id}</option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <ScatterChart width={200} height={32}>
                                        <XAxis dataKey="x" hide domain={this.props.historySpan} />
                                        <YAxis dataKey="y" hide domain={['dataMin', 'dataMax']} />
                                        <Scatter data={this.getHistoryData(arduino)} line={{ stroke: 'black' }} fill='transparent' />
                                    </ScatterChart>
                                </td>
                                <td>
                                    <input type="number" min="0" max="100" defaultValue={index} onChange={(event) => this.onOrderChanged(event, index)}></input>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button>Play</button>
                <button>Stop</button>
            </>
        )
    }
}

export default AQHistory;