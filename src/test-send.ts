// Sends synthetic Forza telemetry packets for dashboard testing
import dgram from 'dgram';

const socket = dgram.createSocket('udp4');
const PORT = 20777;
let t = 0;

function writeF32LE(buf: Buffer, offset: number, value: number) {
  buf.writeFloatLE(value, offset);
}

function buildPacket(t: number): Buffer {
  const buf = Buffer.alloc(311, 0);
  let o = 0;

  const rpm = 2000 + Math.sin(t * 0.05) * 3000;
  const speed = 80 + Math.sin(t * 0.02) * 60; // m/s → km/h later
  const gear = Math.max(1, Math.min(8, Math.floor(speed / 25) + 1));

  buf.writeInt32LE(1, o); o += 4;                 // isRaceOn
  buf.writeUInt32LE(t * 16, o); o += 4;           // timestampMs
  writeF32LE(buf, o, 8000); o += 4;               // engineMaxRpm
  writeF32LE(buf, o, 800); o += 4;                // engineIdleRpm
  writeF32LE(buf, o, rpm); o += 4;                // currentEngineRpm
  o += 12;                                         // acceleration
  writeF32LE(buf, o, speed * 0.3); o += 4;        // velocityX
  writeF32LE(buf, o, 0); o += 4;
  writeF32LE(buf, o, speed * 0.2); o += 4;
  o += 12;                                         // angular velocity
  o += 12;                                         // yaw/pitch/roll

  // suspension (normalized 0-1)
  for (let i = 0; i < 4; i++) { writeF32LE(buf, o, 0.5 + Math.sin(t * 0.1 + i) * 0.2); o += 4; }
  o += 16; // slip ratio
  o += 16; // wheel speed
  o += 16; // on rumble
  o += 16; // puddle
  o += 16; // surface rumble
  o += 16; // slip angle
  o += 16; // combined slip
  o += 16; // suspension meters

  buf.writeInt32LE(1234, o); o += 4;              // carOrdinal
  buf.writeInt32LE(4, o); o += 4;                 // carClass (S1)
  buf.writeInt32LE(820, o); o += 4;               // carPI
  buf.writeInt32LE(1, o); o += 4;                 // drivetrain (RWD)
  buf.writeInt32LE(8, o); o += 4;                 // cylinders

  // Dash block (offset 232)
  o = 232;
  writeF32LE(buf, o, 100); o += 4;               // posX
  writeF32LE(buf, o, 0); o += 4;
  writeF32LE(buf, o, 100); o += 4;               // posZ

  writeF32LE(buf, o, speed); o += 4;              // speed m/s
  writeF32LE(buf, o, rpm * 80); o += 4;           // power W
  writeF32LE(buf, o, rpm * 0.4); o += 4;          // torque Nm

  // tire temps
  const baseTemp = 85 + Math.sin(t * 0.01) * 20;
  writeF32LE(buf, o, baseTemp + 5); o += 4;
  writeF32LE(buf, o, baseTemp); o += 4;
  writeF32LE(buf, o, baseTemp + 8); o += 4;
  writeF32LE(buf, o, baseTemp + 3); o += 4;

  writeF32LE(buf, o, 0.8); o += 4;               // boost
  writeF32LE(buf, o, 0.75); o += 4;              // fuel
  writeF32LE(buf, o, t * speed / 1000); o += 4;  // distance

  writeF32LE(buf, o, 68.5); o += 4;              // bestLap
  writeF32LE(buf, o, 69.2); o += 4;              // lastLap
  writeF32LE(buf, o, (t * 0.016) % 90); o += 4; // currentLap
  writeF32LE(buf, o, t * 0.016); o += 4;         // raceTime

  buf.writeUInt16LE(3, o); o += 2;               // lapNumber
  buf.writeUInt8(1, o); o += 1;                  // racePos

  buf.writeUInt8(Math.floor(200 + Math.sin(t * 0.03) * 55), o); o += 1; // accel
  buf.writeUInt8(Math.max(0, Math.floor(Math.sin(t * 0.07) * 100)), o); o += 1; // brake
  buf.writeUInt8(0, o); o += 1;                  // clutch
  buf.writeUInt8(0, o); o += 1;                  // handbrake
  buf.writeUInt8(gear, o); o += 1;               // gear
  buf.writeInt8(Math.floor(Math.sin(t * 0.02) * 60), o); o += 1; // steer
  buf.writeInt8(0, o); o += 1;
  buf.writeInt8(0, o);

  return buf;
}

console.log('Sending test telemetry to localhost:9999 (Ctrl+C to stop)…');

setInterval(() => {
  const pkt = buildPacket(t++);
  socket.send(pkt, PORT, '127.0.0.1');
}, 16); // ~60 Hz
