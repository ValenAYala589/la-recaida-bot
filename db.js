const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'economia.json');

function leerDatos() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({}), 'utf8');
  }
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function guardarDatos(datos) {
  fs.writeFileSync(DB_PATH, JSON.stringify(datos, null, 2), 'utf8');
}

function getUsuario(userId) {
  const datos = leerDatos();
  if (!datos[userId]) {
    datos[userId] = { userId, balance: 100, lastDaily: 0, lastWork: 0 };
    guardarDatos(datos);
  }
  return datos[userId];
}

function setBalance(userId, balance) {
  const datos = leerDatos();
  if (!datos[userId]) datos[userId] = { userId, balance: 100, lastDaily: 0, lastWork: 0 };
  datos[userId].balance = balance;
  guardarDatos(datos);
}

function addBalance(userId, cantidad) {
  const user = getUsuario(userId);
  const nuevoBalance = user.balance + cantidad;
  setBalance(userId, nuevoBalance);
  return nuevoBalance;
}

function setLastDaily(userId, timestamp) {
  const datos = leerDatos();
  if (!datos[userId]) datos[userId] = { userId, balance: 100, lastDaily: 0, lastWork: 0 };
  datos[userId].lastDaily = timestamp;
  guardarDatos(datos);
}

function setLastWork(userId, timestamp) {
  const datos = leerDatos();
  if (!datos[userId]) datos[userId] = { userId, balance: 100, lastDaily: 0, lastWork: 0 };
  datos[userId].lastWork = timestamp;
  guardarDatos(datos);
}

function getLeaderboard(limit = 10) {
  const datos = leerDatos();
  return Object.values(datos)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, limit);
}

module.exports = {
  getUsuario,
  setBalance,
  addBalance,
  setLastDaily,
  setLastWork,
  getLeaderboard,
};
