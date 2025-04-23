// Script para clicar no botão com ID "oe"
(async function () {
  console.clear();
  console.log(
    "%cClique em Botão - Terminal Drogasil",
    "color: #C41E3A; font-size: 16px; font-weight: bold"
  );
  // Utilitários
  const utils = {
    // Espera um tempo determinado
    esperar: function (ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    // Log formatado
    log: function (mensagem, tipo = "info") {
      const estilos = {
        info: "color: #2196F3",
        sucesso: "color: #4CAF50",
        erro: "color: #F44336",
        aviso: "color: #FF9800",
      };
      const horario = new Date().toLocaleTimeString();
      console.log(`%c[${horario}] ${mensagem}`, estilos[tipo]);
    },
  };
  try {
    // 1. Localizar o botão
    utils.log("Localizando botão com ID 'oe'...", "info");
    const botao = document.getElementById("oe");
    if (!botao) {
      throw new Error("Botão com ID 'oe' não encontrado!");
    }
    utils.log(`Botão encontrado: ${botao.tagName}`, "sucesso");
    // 2. Aguardar um pouco antes de clicar (para visualização)
    await utils.esperar(500);
    // 3. Clicar no botão
    utils.log("Clicando no botão...", "info");
    botao.click();
    utils.log("Botão clicado com sucesso!", "sucesso");
  } catch (erro) {
    utils.log(`Erro ao clicar no botão: ${erro.message}`, "erro");
    console.error(erro);
  }
})();
