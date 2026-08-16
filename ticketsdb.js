const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'tickets-config.json');
const ABIERTOS_PATH = path.join(__dirname, 'tickets-abiertos.json');

const CONFIG_POR_DEFECTO = {
  staffRoleId: null,
  categoriaId: null,
  categoriaVipId: null,
  contador: 0,
};

function leerJSON(filePath, valorPorDefecto) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(valorPorDefecto, null, 2), 'utf8');
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return valorPorDefecto;
  }
}

function guardarJSON(filePath, datos) {
  fs.writeFileSync(filePath, JSON.stringify(datos, null, 2), 'utf8');
}

function getConfig() {
  const config = leerJSON(CONFIG_PATH, CONFIG_POR_DEFECTO);
  return { ...CONFIG_POR_DEFECTO, ...config };
}

function setConfig(cambios) {
  const config = getConfig();
  const nuevo = { ...config, ...cambios };
  guardarJSON(CONFIG_PATH, nuevo);
  return nuevo;
}

function siguienteNumero() {
  const config = getConfig();
  const nuevoContador = (config.contador || 0) + 1;
  setConfig({ contador: nuevoContador });
  return nuevoContador;
}

function getAbiertos() {
  return leerJSON(ABIERTOS_PATH, {});
}

function getTicketDeUsuario(userId) {
  const abiertos = getAbiertos();
  return abiertos[userId] || null;
}

function registrarTicket(userId, channelId) {
  const abiertos = getAbiertos();
  abiertos[userId] = channelId;
  guardarJSON(ABIERTOS_PATH, abiertos);
}

function cerrarTicket(userId) {
  const abiertos = getAbiertos();
  delete abiertos[userId];
  guardarJSON(ABIERTOS_PATH, abiertos);
}

function cerrarTicketPorCanal(channelId) {
  const abiertos = getAbiertos();
  const userId = Object.keys(abiertos).find(id => abiertos[id] === channelId);
  if (userId) delete abiertos[userId];
  guardarJSON(ABIERTOS_PATH, abiertos);
  return userId || null;
}

module.exports = {
  getConfig,
  setConfig,
  siguienteNumero,
  getTicketDeUsuario,
  registrarTicket,
  cerrarTicket,
  cerrarTicketPorCanal,
};
