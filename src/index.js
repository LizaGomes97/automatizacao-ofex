// src/index.js
const { consultarCPF } = require("./automacao/puppeteer");

// CPF para consulta
const cpf = process.argv[2] || "12345678900";

// Executa a consulta
console.log(`🚀 Iniciando automação para o CPF: ${cpf}`);

consultarCPF(cpf)
  .then((resultado) => {
    console.log("✅ Consulta concluída com sucesso!");
    console.log("📋 Dados obtidos:");
    console.log(JSON.stringify(resultado, null, 2));
  })
  .catch((erro) => {
    console.error("❌ Falha na automação:");
    console.error(erro);
    process.exit(1);
  });
