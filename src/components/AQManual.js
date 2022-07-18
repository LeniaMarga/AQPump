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
                    <thead><tr><th>arduino</th><th>inflate</th><th>deflate</th><th>stop</th><th>RGB start</th><th>RGB end</th><th>LED pattern</th></tr></thead>
                    <tbody>
                        {arduinos.map((arduino, index) => (
                            <tr key={arduino.key}>
                                <th title={arduino.base}>{arduino.id}</th>
                                <td><button onClick={() => arduino.inflateAsync()}>inflate</button></td>
                                <td><button onClick={() => arduino.deflateAsync()}>deflate</button></td>
                                <td><button onClick={() => arduino.stopAsync()}>stop</button></td>
                                <td><input type="number" min="0" max="255" value={arduino.startColor[0]} onChange={(event) => arduino.setStartR(event.target.value)} />
                                    <input type="number" min="0" max="255" value={arduino.startColor[1]} onChange={(event) => arduino.setStartG(event.target.value)} />
                                    <input type="number" min="0" max="255" value={arduino.startColor[2]} onChange={(event) => arduino.setStartB(event.target.value)} />
                                </td>
                                <td><input type="number" min="0" max="255" value={arduino.endColor[0]} onChange={(event) => arduino.setEndR(event.target.value)} />
                                    <input type="number" min="0" max="255" value={arduino.endColor[1]} onChange={(event) => arduino.setEndG(event.target.value)} />
                                    <input type="number" min="0" max="255" value={arduino.endColor[2]} onChange={(event) => arduino.setEndB(event.target.value)} />
                                </td>
                                <td>
                                    <select value={arduino.ledPattern} onChange={(event) => arduino.setPattern(event.target.value)}>
                                        <option value="0">Constant RGB end</option>
                                        <option value="1">Fade RGB start to end</option>
                                        <option value="2">Pulse between RGB</option>
                                    </select>
                                    <span class="inputLabel"> in </span>
                                    <input type="number" min="0" value={arduino.ledDelay} onChange={(event) => arduino.setDelay(event.target.value)} />
                                    <span class="inputLabel">ms</span>
                                    <button onClick={() => arduino.showPattern()}>go</button>
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