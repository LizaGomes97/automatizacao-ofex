// scripts/testar-simulacao.js
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

// Caminho para o arquivo HTML
const caminhoHTML = path.join(
  __dirname,
  "../public/sistema-drogasil-simples.html"
);

// Verifica se o arquivo existe
if (!fs.existsSync(caminhoHTML)) {
  console.error("❌ Arquivo HTML de simulação não encontrado!");
  process.exit(1);
}

console.log("🚀 Iniciando teste de simulação...");
console.log(`📄 Abrindo arquivo: ${caminhoHTML}`);

// Abre o arquivo HTML no navegador padrão
let comando;
switch (process.platform) {
  case "win32":
    comando = `start "${caminhoHTML}"`;
    break;
  case "darwin":
    comando = `open "${caminhoHTML}"`;
    break;
  default:
    comando = `xdg-open "${caminhoHTML}"`;
}

exec(comando, (erro) => {
  if (erro) {
    console.error("❌ Erro ao abrir a simulação:", erro);
    return;
  }
  console.log("✅ Simulação aberta no navegador!");
  console.log("ℹ️ Use esta simulação para testar os scripts de automação.");
});
