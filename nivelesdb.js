const fs = require('fs');
const path = require('path');

const USUARIOS_PATH = path.join(__dirname, 'niveles-usuarios.json');
const CONFIG_PATH = path.join(__dirname, 'niveles-config.json');

const CONFIG_POR_DEFECTO = {
  xpMensajeMin: 15,
  xpMensajeMax: 25,
  cooldownMensajeSegundos: 60,
  xpPorMinutoVoz: 10,
  nivelMaximo: 50,
  recompensasPorNivel: {}, // { "5": "roleId123", "15": "roleId456", ... }
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

function setRecompensaNivel(nivel, rolId) {
  const config = getConfig();
  config.recompensasPorNivel[nivel] = rolId;
  guardarJSON(CONFIG_PATH, config);
}

function getUsuarios() {
  return leerJSON(USUARIOS_PATH, {});
}

function getUsuario(userId) {
  const usuarios = getUsuarios();
  return usuarios[userId] || { xp: 0, nivel: 0, ultimoMensajeXP: 0 };
}

function guardarUsuario(userId, datos) {
  const usuarios = getUsuarios();
  usuarios[userId] = { ...getUsuario(userId), ...datos };
  guardarJSON(USUARIOS_PATH, usuarios);
  return usuarios[userId];
}

// XP total acumulada necesaria para llegar al nivel indicado (curva creciente)
function xpTotalParaNivel(nivel) {
  let total = 0;
  for (let n = 1; n <= nivel; n++) {
    total += 100 + (n - 1) * 50;
  }
  return total;
}

function nivelDesdeXP(xpTotal, nivelMaximo) {
  let nivel = 0;
  while (nivel < nivelMaximo && xpTotal >= xpTotalParaNivel(nivel + 1)) {
    nivel++;
  }
  return nivel;
}

// Suma XP a un usuario y devuelve { nuevoNivel, subioDeNivel, xpTotal }
function agregarXP(userId, cantidad) {
  const config = getConfig();
  const usuario = getUsuario(userId);
  const nivelAnterior = usuario.nivel || 0;
  const xpTotal = (usuario.xp || 0) + cantidad;
  const nuevoNivel = nivelDesdeXP(xpTotal, config.nivelMaximo);

  guardarUsuario(userId, { xp: xpTotal, nivel: nuevoNivel });

  return { xpTotal, nuevoNivel, subioDeNivel: nuevoNivel > nivelAnterior };
}

function getTop(limit = 10) {
  const usuarios = getUsuarios();
  return Object.entries(usuarios)
    .map(([userId, datos]) => ({ userId, xp: datos.xp || 0, nivel: datos.nivel || 0 }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limit);
}

module.exports = {
  getConfig,
  setConfig,
  setRecompensaNivel,
  getUsuario,
  guardarUsuario,
  xpTotalParaNivel,
  nivelDesdeXP,
  agregarXP,
  getTop,
};
