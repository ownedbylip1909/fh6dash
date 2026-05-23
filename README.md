# Forza Horizon Telemetry Dashboard

Live-Telemetrie-Dashboard für Forza Horizon 4/5 auf deinem Mac.

## Start

```bash
npm run dev
```

Dashboard öffnet sich unter **http://localhost:3000**

## Forza einrichten

1. Forza → **Einstellungen** → **HUD und Gameplay**
2. Scrolle zu **Data Out** (ganz unten)
3. Einstellungen:
   - **Data Out**: EIN
   - **Data Out IP**: deine Mac-IP (wird im Dashboard-Overlay angezeigt)
   - **Data Out Port**: `9999`
   - **Data Out Format**: `Car Dash`

## Dashboard testen (ohne Forza)

```bash
npx tsx src/test-send.ts
```

Sendet simulierte Telemetriedaten mit variabler Geschwindigkeit, RPM und Reifentemperaturen.

## Was wird angezeigt

| Bereich | Daten |
|---|---|
| Mitte | Geschwindigkeit (km/h), Gang, RPM-Bogen |
| Links oben | Gas / Bremse / Kupplung / Handbremse |
| Links unten | Leistung (PS), Drehmoment, Boost, Kraftstoff |
| Rechts oben | Bestzeit, letzte Runde, aktuelle Runde, Position |
| Rechts unten | Reifentemperaturen (farbcodiert: blau→grün→gelb→rot) |
| Fußzeile | Car PI, Fahrzeugklasse, Distanz, Lenkwinkel |

## Ports

| Service | Port |
|---|---|
| HTTP Dashboard | 3000 |
| UDP Telemetrie | 9999 |
