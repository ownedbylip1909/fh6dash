export interface TelemetryData {
  isRaceOn: boolean;
  timestampMs: number;

  engineMaxRpm: number;
  engineIdleRpm: number;
  currentEngineRpm: number;

  accelerationX: number;
  accelerationY: number;
  accelerationZ: number;

  velocityX: number;
  velocityY: number;
  velocityZ: number;

  angularVelocityX: number;
  angularVelocityY: number;
  angularVelocityZ: number;

  yaw: number;
  pitch: number;
  roll: number;

  suspensionFL: number;
  suspensionFR: number;
  suspensionRL: number;
  suspensionRR: number;

  tireSlipRatioFL: number;
  tireSlipRatioFR: number;
  tireSlipRatioRL: number;
  tireSlipRatioRR: number;

  wheelSpeedFL: number;
  wheelSpeedFR: number;
  wheelSpeedRL: number;
  wheelSpeedRR: number;

  tireSlipAngleFL: number;
  tireSlipAngleFR: number;
  tireSlipAngleRL: number;
  tireSlipAngleRR: number;

  tireCombinedSlipFL: number;
  tireCombinedSlipFR: number;
  tireCombinedSlipRL: number;
  tireCombinedSlipRR: number;

  carOrdinal: number;
  carClass: number;
  carPerformanceIndex: number;
  drivetrainType: number;
  numCylinders: number;

  carGroup: number;
  smashableVelDiff: number;
  smashableMass: number;

  positionX: number;
  positionY: number;
  positionZ: number;

  speed: number;
  speedKmh: number;

  power: number;
  powerKw: number;
  powerHp: number;

  torque: number;

  tireTempFL: number;
  tireTempFR: number;
  tireTempRL: number;
  tireTempRR: number;

  boost: number;
  boostPsi: number;
  boostBar: number;

  fuel: number;
  distanceTraveled: number;

  bestLap: number;
  lastLap: number;
  currentLap: number;
  currentRaceTime: number;

  lapNumber: number;
  racePosition: number;

  accel: number;
  brake: number;
  clutch: number;
  handBrake: number;

  gear: number;
  steer: number;

  normalizedDrivingLine: number;
  normalizedAIBrakeDiff: number;

  gForceLat: number;
  gForceLon: number;
  gForceVert: number;

  driftAngle: number;
  wheelspin: boolean;
  launchG: number;
}

export function parsePacket(buf: Buffer): TelemetryData | null {
  if (buf.length < 232) return null;

  const r32 = (o: number) => buf.readFloatLE(o);
  const i32 = (o: number) => buf.readInt32LE(o);
  const u32 = (o: number) => buf.readUInt32LE(o);

  let offset = 0;

  const isRaceOn = i32(offset) !== 0; offset += 4;
  const timestampMs = u32(offset); offset += 4;

  const engineMaxRpm = r32(offset); offset += 4;
  const engineIdleRpm = r32(offset); offset += 4;
  const currentEngineRpm = r32(offset); offset += 4;

  const accelerationX = r32(offset); offset += 4;
  const accelerationY = r32(offset); offset += 4;
  const accelerationZ = r32(offset); offset += 4;

  const velocityX = r32(offset); offset += 4;
  const velocityY = r32(offset); offset += 4;
  const velocityZ = r32(offset); offset += 4;

  const angularVelocityX = r32(offset); offset += 4;
  const angularVelocityY = r32(offset); offset += 4;
  const angularVelocityZ = r32(offset); offset += 4;

  const yaw = r32(offset); offset += 4;
  const pitch = r32(offset); offset += 4;
  const roll = r32(offset); offset += 4;

  const suspensionFL = r32(offset); offset += 4;
  const suspensionFR = r32(offset); offset += 4;
  const suspensionRL = r32(offset); offset += 4;
  const suspensionRR = r32(offset); offset += 4;

  const tireSlipRatioFL = r32(offset); offset += 4;
  const tireSlipRatioFR = r32(offset); offset += 4;
  const tireSlipRatioRL = r32(offset); offset += 4;
  const tireSlipRatioRR = r32(offset); offset += 4;

  const wheelSpeedFL = r32(offset); offset += 4;
  const wheelSpeedFR = r32(offset); offset += 4;
  const wheelSpeedRL = r32(offset); offset += 4;
  const wheelSpeedRR = r32(offset); offset += 4;

  offset += 48;

  const tireSlipAngleFL = r32(offset); offset += 4;
  const tireSlipAngleFR = r32(offset); offset += 4;
  const tireSlipAngleRL = r32(offset); offset += 4;
  const tireSlipAngleRR = r32(offset); offset += 4;

  const tireCombinedSlipFL = r32(offset); offset += 4;
  const tireCombinedSlipFR = r32(offset); offset += 4;
  const tireCombinedSlipRL = r32(offset); offset += 4;
  const tireCombinedSlipRR = r32(offset); offset += 4;

  offset += 16;

  const carOrdinal = i32(offset); offset += 4;
  const carClass = i32(offset); offset += 4;
  const carPerformanceIndex = i32(offset); offset += 4;
  const drivetrainType = i32(offset); offset += 4;
  const numCylinders = i32(offset); offset += 4;

  let carGroup = 0;
  let smashableVelDiff = 0;
  let smashableMass = 0;

  const isFH6 = buf.length >= 324;

  if (isFH6) {
    carGroup = i32(offset); offset += 4;
    smashableVelDiff = r32(offset); offset += 4;
    smashableMass = r32(offset); offset += 4;
  }

  const positionX = r32(offset); offset += 4;
  const positionY = r32(offset); offset += 4;
  const positionZ = r32(offset); offset += 4;

  const speed = r32(offset); offset += 4;
  const power = r32(offset); offset += 4;
  const torque = r32(offset); offset += 4;

  const tireTempFL = r32(offset); offset += 4;
  const tireTempFR = r32(offset); offset += 4;
  const tireTempRL = r32(offset); offset += 4;
  const tireTempRR = r32(offset); offset += 4;

  const boost = r32(offset); offset += 4;
  const fuel = r32(offset); offset += 4;
  const distanceTraveled = r32(offset); offset += 4;

  const bestLap = r32(offset); offset += 4;
  const lastLap = r32(offset); offset += 4;
  const currentLap = r32(offset); offset += 4;
  const currentRaceTime = r32(offset); offset += 4;

  const lapNumber = buf.readUInt16LE(offset); offset += 2;
  const racePosition = buf.readUInt8(offset); offset += 1;

  const accel = buf.readUInt8(offset); offset += 1;
  const brake = buf.readUInt8(offset); offset += 1;
  const clutch = buf.readUInt8(offset); offset += 1;
  const handBrake = buf.readUInt8(offset); offset += 1;

  const gear = buf.readUInt8(offset); offset += 1;
  const steer = buf.readInt8(offset); offset += 1;

  const normalizedDrivingLine = buf.readInt8(offset); offset += 1;
  const normalizedAIBrakeDiff = buf.readInt8(offset);

  const speedKmh = speed * 3.6;

  const powerKw = power / 1000;
  const powerHp = power / 735.5;

  const boostPsi = boost;
  const boostBar = boost / 14.5038;

  const gForceLat = accelerationX / 9.81;
  const gForceLon = -accelerationZ / 9.81;
  const gForceVert = accelerationY / 9.81;

  const rearSlip =
    (tireSlipRatioRL + tireSlipRatioRR) / 2;

  const wheelspin = rearSlip > 1.1;

  const driftAngle =
    Math.atan2(velocityX, velocityZ) - yaw;

  const launchG = Math.max(0, gForceLon);

  return {
    isRaceOn,
    timestampMs,

    engineMaxRpm,
    engineIdleRpm,
    currentEngineRpm,

    accelerationX,
    accelerationY,
    accelerationZ,

    velocityX,
    velocityY,
    velocityZ,

    angularVelocityX,
    angularVelocityY,
    angularVelocityZ,

    yaw,
    pitch,
    roll,

    suspensionFL,
    suspensionFR,
    suspensionRL,
    suspensionRR,

    tireSlipRatioFL,
    tireSlipRatioFR,
    tireSlipRatioRL,
    tireSlipRatioRR,

    wheelSpeedFL,
    wheelSpeedFR,
    wheelSpeedRL,
    wheelSpeedRR,

    tireSlipAngleFL,
    tireSlipAngleFR,
    tireSlipAngleRL,
    tireSlipAngleRR,

    tireCombinedSlipFL,
    tireCombinedSlipFR,
    tireCombinedSlipRL,
    tireCombinedSlipRR,

    carOrdinal,
    carClass,
    carPerformanceIndex,
    drivetrainType,
    numCylinders,

    carGroup,
    smashableVelDiff,
    smashableMass,

    positionX,
    positionY,
    positionZ,

    speed,
    speedKmh,

    power,
    powerKw,
    powerHp,

    torque,

    tireTempFL,
    tireTempFR,
    tireTempRL,
    tireTempRR,

    boost,
    boostPsi,
    boostBar,

    fuel,
    distanceTraveled,

    bestLap,
    lastLap,
    currentLap,
    currentRaceTime,

    lapNumber,
    racePosition,

    accel,
    brake,
    clutch,
    handBrake,

    gear,
    steer,

    normalizedDrivingLine,
    normalizedAIBrakeDiff,

    gForceLat,
    gForceLon,
    gForceVert,

    driftAngle,
    wheelspin,
    launchG,
  };
}