import React, { Component } from 'react';
import global from '../global.js';
const { arduinos } = global;

class AQStatus extends Component {
    onInflateAll = () => {
        arduinos.forEach(arduino => arduino.inflateAsync());
    }
    onDeflateAll = () => {
        arduinos.forEach(arduino => arduino.deflateAsync());
    }
    onStopAll = () => {
        arduinos.forEach(arduino => arduino.stopAsync());
    }


    render() {
        return (
            <>
                <table id="manual">
                    <thead><tr><th>arduino</th><th>inflate</th><th>deflate</th><th>stop</th><th>color</th></tr></thead>
                    <tbody>
                        {arduinos.map((arduino, index) => (
                            <tr key={arduino.key}>
                                <th title={arduino.base}>{arduino.id}</th>
                                <td><button onClick={() => arduino.inflateAsync()}>inflate</button></td>
                                <td><button onClick={() => arduino.deflateAsync()}>deflate</button></td>
                                <td><button onClick={() => arduino.stopAsync()}>stop</button></td>
                                <td><input name="rgb" type="number" min="0" max="255" value={arduino.color[0]} onChange={(event) => arduino.setR(event.target.value)} />
                                    <input name="rgb" type="number" min="0" max="255" value={arduino.color[1]} onChange={(event) => arduino.setG(event.target.value)} />
                                    <input name="rgb" type="number" min="0" max="255" value={arduino.color[2]} onChange={(event) => arduino.setB(event.target.value)} />
                                    <button onClick={() => arduino.setColor([0, 0, 0])}>off</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div id="statusButtons">
                    <button onClick={this.onInflateAll}>INFLATE ALL</button>
                    <button onClick={this.onDefalateAll}>DEFLATE ALL</button>
                    <button onClick={this.onStopAll}>STOP ALL</button>
                </div>
            </>
        )
    }
}

export default AQStatus;