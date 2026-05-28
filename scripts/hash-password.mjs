// Genera el hash bcrypt de una contraseña, para pegar en ADMIN_PASSWORD_HASH.
// Uso: node scripts/hash-password.mjs "tu-contraseña"
import bcrypt from "bcryptjs";

const pw = process.argv[2];
if (!pw) {
  console.error('Uso: node scripts/hash-password.mjs "tu-contraseña"');
  process.exit(1);
}

// Next.js expande variables con $ en los .env y rompe el hash bcrypt (lleno
// de $). Escapamos los $ como \$ e imprimimos la línea lista para pegar.
const hash = bcrypt.hashSync(pw, 10);
console.log("ADMIN_PASSWORD_HASH=" + hash.split("$").join("\\$"));
