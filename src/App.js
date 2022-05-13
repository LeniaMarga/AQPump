import React, { Component } from 'react';
import './App.css';
import AQSourceSelector from './components/AQSourceSelector';
import AQStatus from './components/AQStatus';

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
          <div id="status">
            <h2>Arduino status</h2>
            <AQStatus />
          </div>
        </div>
      </>
    )
  }
}

export default App;
