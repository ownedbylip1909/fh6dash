import dgram from 'dgram';
import http from 'http';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { parsePacket } from './parser';

const UDP_PORT = 20777;
const HTTP_PORT = 3000;

// In a packaged asar, writable files live in app.asar.unpacked
const appRoot = __dirname.replace(/[/\\]dist$/, '').replace('app.asar', 'app.asar.unpacked');
const CARS_FILE = path.join(appRoot, 'data', 'cars.json');

function loadCars(): Record<string, string> {
  try {
    return JSON.parse(fs.readFileSync(CARS_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveCars(db: Record<string, string>) {
  fs.writeFileSync(CARS_FILE, JSON.stringify(db, null, 2));
}

function getLocalIP(): string {
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const iface of ifaces ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }

  return 'localhost';
}

const httpServer = http.createServer((req, res) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  if (req.url === '/ip') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(getLocalIP());
    return;
  }

  if (req.method === 'GET' && req.url === '/api/cars') {
    res.writeHead(200, cors);
    res.end(JSON.stringify(loadCars()));
    return;
  }

  if (req.method === 'POST' && req.url === '/api/cars') {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const { ordinal, name } = JSON.parse(body);

        const db = loadCars();

        db[String(ordinal)] = name.trim();

        saveCars(db);

        broadcast({
          type: 'cars',
          cars: db,
        });

        res.writeHead(200, cors);
        res.end(JSON.stringify({ ok: true }));
      } catch {
        res.writeHead(400, cors);
        res.end(JSON.stringify({
          error: 'invalid JSON',
        }));
      }
    });

    return;
  }

  const url =
    req.url === '/'
      ? '/index.html'
      : req.url ?? '/index.html';

  const filePath = path.join(
    __dirname,
    '..',
    'public',
    path.basename(url)
  );

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath);

    const contentTypes: Record<string, string> = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
    };

    res.writeHead(200, {
      'Content-Type':
        contentTypes[ext] ?? 'text/plain',
    });

    res.end(data);
  });
});

const wss = new WebSocketServer({
  server: httpServer,
});

function broadcast(data: object) {
  const msg = JSON.stringify(data);

  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

wss.on('connection', (ws) => {
  console.log(
    `[WS] Dashboard connected (${wss.clients.size})`
  );

  ws.send(JSON.stringify({
    type: 'cars',
    cars: loadCars(),
  }));

  ws.on('close', () => {
    console.log(
      `[WS] Dashboard disconnected (${wss.clients.size})`
    );
  });
});

const udp = dgram.createSocket({ type: 'udp4', reuseAddr: true });

let latestData: any = null;

let dragStartTime: number | null = null;

let zeroToHundredTime: number | null = null;
let hundredToTwoHundredTime: number | null = null;
let quarterMileTime: number | null = null;

let quarterMileStartDistance: number | null = null;

udp.on('message', (msg) => {
  const data = parsePacket(msg);

  if (!data) return;

  const now = Date.now();

  const speed = data.speedKmh;

  if (speed > 1 && dragStartTime === null) {
    dragStartTime = now;

    zeroToHundredTime = null;
    hundredToTwoHundredTime = null;
    quarterMileTime = null;

    quarterMileStartDistance =
      data.distanceTraveled;
  }

  if (
    speed >= 100 &&
    zeroToHundredTime === null &&
    dragStartTime !== null
  ) {
    zeroToHundredTime =
      (now - dragStartTime) / 1000;

    console.log(
      `🔥 0-100 ${zeroToHundredTime.toFixed(2)}s`
    );
  }

  if (
    speed >= 200 &&
    hundredToTwoHundredTime === null &&
    dragStartTime !== null &&
    zeroToHundredTime !== null
  ) {
    hundredToTwoHundredTime =
      ((now - dragStartTime) / 1000) -
      zeroToHundredTime;

    console.log(
      `🚀 100-200 ${hundredToTwoHundredTime.toFixed(2)}s`
    );
  }

  if (
    quarterMileStartDistance !== null &&
    quarterMileTime === null &&
    data.distanceTraveled -
      quarterMileStartDistance >=
      402.336
  ) {
    quarterMileTime =
      (now - dragStartTime!) / 1000;

    console.log(
      `🏁 1/4 Mile ${quarterMileTime.toFixed(3)}s`
    );
  }

  if (speed < 1) {
    dragStartTime = null;
  }

  latestData = {
    ...data,

    drag: {
      zeroToHundredTime,
      hundredToTwoHundredTime,
      quarterMileTime,
    },
  };
});

setInterval(() => {
  if (!latestData) return;

  broadcast(latestData);
}, 1000 / 60);

udp.bind(UDP_PORT);

httpServer.listen(HTTP_PORT, () => {
  const ip = getLocalIP();

  console.log(``);
  console.log(`FH6 TELEMETRY`);
  console.log(`Dashboard: http://localhost:${HTTP_PORT}`);
  console.log(`UDP Port: ${UDP_PORT}`);
  console.log(`IP: ${ip}`);
  console.log(``);
});