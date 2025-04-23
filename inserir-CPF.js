// Script para Busca de CPF no Terminal Drogasil
(async function () {
  console.clear();
  console.log(
    "%cBusca de CPF - Terminal Drogasil",
    "color: #C41E3A; font-size: 16px; font-weight: bold"
  );
  // Configurações
  const cpf = "076.954.805-92"; // Substitua pelo CPF do cliente
  const tempoEspera = 800; // Tempo de espera entre ações (ms)
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
    // 1. Localizar campo de CPF
    utils.log("Localizando campo de CPF...", "info");
    const campoCpf = document.getElementById("txtCpfAtendimento");
    if (!campoCpf) {
      throw new Error("Campo de CPF não encontrado (ID: txtCpfAtendimento)!");
    }
    utils.log(`Campo de CPF encontrado: ${campoCpf.id}`, "sucesso");
    // 2. Limpar e focar no campo
    utils.log("Focando campo de CPF...", "info");
    campoCpf.focus();
    campoCpf.select();
    campoCpf.value = "";
    await utils.esperar(300);
    // 3. Preencher o CPF caractere por caractere
    utils.log(`Preenchendo CPF: ${cpf}`, "info");
    for (let i = 0; i < cpf.length; i++) {
      // Adicionar o caractere ao valor do campo
      const char = cpf.charAt(i);
      // Adicionar o caractere
      campoCpf.value += char;
      // Disparar evento de input após cada caractere
      campoCpf.dispatchEvent(new Event("input", { bubbles: true }));
      // Aguardar entre cada caractere para simular digitação humana
      await utils.esperar(50);
    }
    // Verificar se o CPF foi preenchido corretamente
    if (campoCpf.value !== cpf) {
      utils.log(
        "O CPF não foi preenchido corretamente. Tentando novamente...",
        "aviso"
      );
      // Método alternativo
      campoCpf.value = cpf;
      campoCpf.dispatchEvent(new Event("input", { bubbles: true }));
    }
    utils.log(`Valor atual do campo: "${campoCpf.value}"`, "info");
    // Disparar eventos finais
    campoCpf.dispatchEvent(new Event("change", { bubbles: true }));
    campoCpf.dispatchEvent(new Event("blur", { bubbles: true }));
    // Aguardar para garantir que o campo foi preenchido
    await utils.esperar(tempoEspera);
    // 4. Encontrar e clicar no botão de busca
    utils.log("Procurando botão de busca (ID: buttonCliente)...", "info");
    const botaoBusca = document.getElementById("buttonCliente");
    if (!botaoBusca) {
      utils.log(
        "Botão de busca não encontrado por ID. Tentando métodos alternativos...",
        "aviso"
      );
      // Tentar encontrar por outros métodos
      const botoesPossiveis = [
        document.querySelector('button[onclick*="busca"]'),
        document.querySelector('button[onclick*="cpf"]'),
        document.querySelector('button[onclick*="cliente"]'),
        document.querySelector('input[type="submit"]'),
        document.querySelector('button[type="submit"]'),
      ];
      // Filtrar apenas os botões que existem
      const botoesValidos = botoesPossiveis.filter((btn) => btn !== null);
      if (botoesValidos.length > 0) {
        // Usar o primeiro botão encontrado
        const botaoAlternativo = botoesValidos[0];
        utils.log(
          `Botão alternativo encontrado: ${botaoAlternativo.tagName}`,
          "sucesso"
        );
        // Aguardar antes de clicar
        await utils.esperar(500);
        // Clicar no botão
        utils.log("Clicando no botão alternativo...", "info");
        botaoAlternativo.click();
        utils.log("Busca de CPF iniciada!", "sucesso");
      } else {
        // Tentar enviar o formulário diretamente
        const form = campoCpf.closest("form");
        if (form) {
          utils.log("Tentando enviar o formulário diretamente...", "info");
          form.submit();
          utils.log("Formulário enviado!", "sucesso");
        } else {
          // Última alternativa: simular tecla Enter
          utils.log("Simulando tecla Enter como último recurso...", "aviso");
          campoCpf.focus();
          const enterEvent = new KeyboardEvent("keydown", {
            key: "Enter",
            code: "Enter",
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true,
          });
          campoCpf.dispatchEvent(enterEvent);
          utils.log("Evento Enter disparado no campo de CPF", "info");
        }
      }
    } else {
      // Aguardar antes de clicar
      await utils.esperar(500);
      // Clicar no botão
      utils.log("Clicando no botão de busca...", "info");
      botaoBusca.click();
      utils.log("Busca de CPF iniciada com sucesso!", "sucesso");
    }
  } catch (erro) {
    console.error("Erro durante a busca de CPF:", erro);
  }
})();
