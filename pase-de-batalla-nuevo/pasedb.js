const fs = require('fs');
const path = require('path');

const USUARIOS_PATH = path.join(__dirname, 'pase-usuarios.json');
const CONFIG_PATH = path.join(__dirname, 'pase-config.json');

const CONFIG_POR_DEFECTO = {
  costoBase: 50,
  costoIncremento: 15,
  nivelMaximo: 50,
  recompensasEspeciales: {}, // { "10": { lunas: 200, rolId: "123..." }, ... }
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
  // aseguramos que existan todas las claves aunque el archivo sea viejo
  return { ...CONFIG_POR_DEFECTO, ...config };
}

function setConfig(cambios) {
  const config = getConfig();
  const nuevo = { ...config, ...cambios };
  guardarJSON(CONFIG_PATH, nuevo);
  return nuevo;
}

function setRecompensaNivel(nivel, { lunas, rolId }) {
  const config = getConfig();
  const actual = config.recompensasEspeciales[nivel] || {};
  config.recompensasEspeciales[nivel] = {
    lunas: lunas !== undefined ? lunas : (actual.lunas || 0),
    rolId: rolId !== undefined ? rolId : (actual.rolId || null),
  };
  guardarJSON(CONFIG_PATH, config);
  return config.recompensasEspeciales[nivel];
}

function getUsuarios() {
  return leerJSON(USUARIOS_PATH, {});
}

function getNivelUsuario(userId) {
  const usuarios = getUsuarios();
  return usuarios[userId]?.nivel || 0;
}

function setNivelUsuario(userId, nivel) {
  const usuarios = getUsuarios();
  usuarios[userId] = { nivel };
  guardarJSON(USUARIOS_PATH, usuarios);
}

// Costo en Lunas para comprar el nivel indicado (subir de nivel-1 a nivel)
function costoDeNivel(nivel) {
  const config = getConfig();
  return config.costoBase + (nivel - 1) * config.costoIncremento;
}

// Recompensa (lunas + rol opcional) al comprar el nivel indicado
function recompensaDeNivel(nivel) {
  const config = getConfig();
  const especial = config.recompensasEspeciales[nivel];
  if (especial) return especial;
  // recompensa por defecto: 30% del costo del nivel, sin rol
  const costo = costoDeNivel(nivel);
  return { lunas: Math.round(costo * 0.3), rolId: null };
}

function getTop(limit = 10) {
  const usuarios = getUsuarios();
  return Object.entries(usuarios)
    .map(([userId, datos]) => ({ userId, nivel: datos.nivel || 0 }))
    .sort((a, b) => b.nivel - a.nivel)
    .slice(0, limit);
}

module.exports = {
  getConfig,
  setConfig,
  setRecompensaNivel,
  getNivelUsuario,
  setNivelUsuario,
  costoDeNivel,
  recompensaDeNivel,
  getTop,
};
