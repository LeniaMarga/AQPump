import React, { Component } from 'react';
import './App.css';
import AQSourceSelector from './components/AQSourceSelector';
import AQStatus from './components/AQStatus';
import AQManual from './components/AQManual';

import global from './global.js';
const { arduinos, rooms } = global;

class App extends Component {
  constructor(props) {
    super(props);

    window.app = this;
  }

  onRoomValueChanged = (event) => {
    arduinos.forEach(arduino => {
      if (event.sender === arduino.room && event.key === arduino.sensor.key)
        arduino.updateValueAsync(event.value);
    });
  }

  onArduinoValueChanged = (event) => {
    if (event.key === "valueSource") {
      let arduino = event.sender;
      if (arduino.room && arduino.sensor) {
        let value = arduino.room.getStateValue(arduino.sensor);
        arduino.updateValueAsync(value);
      }
    }
  }

  componentDidMount() {
    rooms.forEach(room => room.addEventListener("valueChanged", this.onRoomValueChanged));
    arduinos.forEach(arduino => arduino.addEventListener("valueChanged", this.onArduinoValueChanged));
  }

  componentWillUnmount() {
    rooms.forEach(room => room.removeEventListener("valueChanged", this.onRoomValueChanged));
    arduinos.forEach(arduino => arduino.removeEventListener("valueChanged", this.onArduinoValueChanged));
  }

  render() {

    return (
      <>
        <h1>☁️ Air Quality now</h1>
        <div id="dashboard">
          <div id="realtime">
            <h2>Real-time values</h2>
            <AQSourceSelector />
          </div>
          <div id="right">
            <div id="status">
              <h2>Arduino status</h2>
              <AQStatus />
            </div>
            <div id="manual">
              <h2>Manual control</h2>
              <AQManual />
            </div>
          </div>
        </div>
        <h2>Instructions</h2>
        <p>The table shows columns of option buttons for all arduinos defined in <em>global.js</em>. The column headers correspond to arudinos' ids. Hovering over an id shows the arduino's IP address.</p>
        <p><b>Show live data:</b> Use the option buttons in the table to connect given arduino to the desired data source. The arduino will keep receiving current live data. Note that playing a history data on an arduino will deselect it from the real-time values.</p>
        <p><b>Play history on chained arduinos:</b> In the "play on" text box next to the history data source, enter the ids of arduinos that should play that history in sequence (e.g. 123). Press the <em>Play</em> button to start playing the history. The playback sets the first arduino in the "play on" list to the oldest value in history. When arduino is done visualizing the value, then the next arduino in the list will show the oldest value, while the first arduino will show the second oldest value. When both arduinos are done with showing the values, the next value is shown and so on, until the last arduino shows the newest value.</p>
        <p><b>Play history in parallel:</b> To play simultaneous history of different data sources on different arduinos (e.g. arduino 1 shows room 1 history and arduino 2 shows room 2 history), put one or more arduino ids next to the respective data sources and press <em>Play</em>.</p>
        <p><b>Emergency buttons:</b> Note that manual control buttons do not stop the history playback or receiving live values. Use the <em>Stop</em> button to stop the playback.</p>
      </>
    )
  }
}

export default App;
