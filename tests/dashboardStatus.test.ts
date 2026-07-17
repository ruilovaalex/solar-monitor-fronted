import assert from "node:assert/strict";
import test from "node:test";
import {
  formatElapsedTime,
  getDashboardAvailability,
  getShortestRangeContainingTimestamp,
  isReadingStale,
} from "../src/utils/dashboardStatus.ts";

const NOW = new Date("2026-07-14T18:00:00.000Z");

test("mantiene el rango cuando la última lectura está disponible", () => {
  const state = getDashboardAvailability({
    hasChartData: true,
    hasQueryError: false,
    lastReadingAt: "2026-07-14T17:59:00.000Z",
    selectedRange: "24h",
    now: NOW,
  });

  assert.equal(state.kind, "available");
  assert.equal(state.fallbackRange, null);
});

test("elige el rango más corto que incluye datos históricos", () => {
  assert.equal(
    getShortestRangeContainingTimestamp("2026-07-11T18:00:00.000Z", NOW),
    "7d",
  );

  const state = getDashboardAvailability({
    hasChartData: false,
    hasQueryError: false,
    lastReadingAt: "2026-07-11T18:00:00.000Z",
    selectedRange: "24h",
    deviceName: "ESP32 principal",
    deviceStatus: "offline",
    now: NOW,
  });

  assert.equal(state.kind, "disconnected");
  assert.equal(state.fallbackRange, "7d");
  assert.match(state.description, /ESP32 principal está sin conexión/);
});

test("diferencia dispositivo conectado sin datos en el rango", () => {
  const state = getDashboardAvailability({
    hasChartData: false,
    hasQueryError: false,
    lastReadingAt: "2026-07-13T19:00:00.000Z",
    selectedRange: "today",
    deviceName: "Raspberry Pi",
    deviceStatus: "online",
    now: NOW,
  });

  assert.equal(state.kind, "connected-empty");
  assert.equal(state.fallbackRange, "24h");
});

test("diferencia un sistema que nunca recibió lecturas", () => {
  const state = getDashboardAvailability({
    hasChartData: false,
    hasQueryError: false,
    lastReadingAt: null,
    selectedRange: "today",
    deviceName: "ESP32 nuevo",
    deviceStatus: "offline",
    now: NOW,
  });

  assert.equal(state.kind, "never");
  assert.equal(state.fallbackRange, null);
});

test("mantiene el error de API separado del estado vacío", () => {
  const state = getDashboardAvailability({
    hasChartData: false,
    hasQueryError: true,
    lastReadingAt: null,
    selectedRange: "today",
    now: NOW,
  });

  assert.equal(state.kind, "query-error");
});

test("detecta datos desactualizados con el intervalo esperado", () => {
  assert.equal(isReadingStale("2026-07-14T17:59:50.000Z", 5, NOW), false);
  assert.equal(isReadingStale("2026-07-14T17:58:00.000Z", 5, NOW), true);
  assert.equal(formatElapsedTime("2026-07-09T18:00:00.000Z", NOW), "5 días");
});
