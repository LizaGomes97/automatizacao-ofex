// Verificador de Janelas do Terminal Drogasil
(async function () {
  console.clear();
  console.log(
    "%cVerificador de Janelas - Terminal Drogasil",
    "color: #C41E3A; font-size: 16px; font-weight: bold"
  );

  // Configurações
  window.DrogasilAutomacao = window.DrogasilAutomacao || {};

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

  // Verificar se estamos em uma página do Terminal Drogasil
  function verificarPaginaAtual() {
    // Elementos ou URLs específicos do Terminal Drogasil
    const urlDrogasil =
      window.location.href.toLowerCase().includes("tcdrsil") ||
      window.location.href.toLowerCase().includes("drogasil") ||
      window.location.href.toLowerCase().includes("rd.com.br");

    const elementosEspecificos =
      document.getElementById("txtAtendente") !== null ||
      document.getElementById("txtCpfAtendimento") !== null ||
      document.getElementById("buttonCliente") !== null ||
      document.getElementById("oe") !== null ||
      document.querySelector(".logo")?.textContent?.includes("DROGASIL") ||
      document.title.includes("Drogasil") ||
      document.title.includes("Terminal");

    return urlDrogasil || elementosEspecificos;
  }

  try {
    // Verificar se estamos na página do Terminal Drogasil
    const estamosNaPagina = verificarPaginaAtual();

    if (estamosNaPagina) {
      utils.log("✅ Esta página é do Terminal Drogasil", "sucesso");
      window.DrogasilAutomacao.terminalEncontrado = true;
      window.DrogasilAutomacao.janela = window;

      // Identificar o estado atual da página
      utils.log("Analisando estado atual da página...", "info");

      const temCampoLogin = document.getElementById("txtAtendente") !== null;
      const temCampoCpf = document.getElementById("txtCpfAtendimento") !== null;
      const temBotaoCpf = document.getElementById("buttonCliente") !== null;
      const temBotaoOe = document.getElementById("oe") !== null;

      if (temCampoLogin) {
        utils.log("Estado: Tela de Login", "info");
        window.DrogasilAutomacao.estado = "login";
      } else if (temCampoCpf) {
        utils.log("Estado: Tela de Busca de CPF", "info");
        window.DrogasilAutomacao.estado = "busca_cpf";

        if (temBotaoOe) {
          utils.log("Botão 'oe' encontrado nesta tela", "info");
        }
      } else {
        utils.log("Estado: Outra tela do Terminal Drogasil", "info");
        window.DrogasilAutomacao.estado = "outra";
      }

      return {
        encontrado: true,
        janela: window,
        estado: window.DrogasilAutomacao.estado,
      };
    } else {
      utils.log("❌ Esta página não é do Terminal Drogasil", "aviso");

      // Verificar outras janelas/frames abertos
      utils.log("Verificando outras janelas/frames...", "info");

      // Verificar iframes na página atual
      const iframes = document.querySelectorAll("iframe");
      for (let i = 0; i < iframes.length; i++) {
        try {
          const iframe = iframes[i];
          const conteudoIframe =
            iframe.contentDocument || iframe.contentWindow.document;

          // Verificar se o iframe contém elementos do Terminal Drogasil
          const temElementosDrogasil =
            conteudoIframe.getElementById("txtAtendente") !== null ||
            conteudoIframe.getElementById("txtCpfAtendimento") !== null ||
            conteudoIframe.title?.includes("Drogasil") ||
            conteudoIframe
              .querySelector(".logo")
              ?.textContent?.includes("DROGASIL");

          if (temElementosDrogasil) {
            utils.log(
              `✅ Terminal Drogasil encontrado no iframe #${i}`,
              "sucesso"
            );
            window.DrogasilAutomacao.terminalEncontrado = true;
            window.DrogasilAutomacao.janela = iframe.contentWindow;

            // Identificar o estado
            const temCampoLogin =
              conteudoIframe.getElementById("txtAtendente") !== null;
            const temCampoCpf =
              conteudoIframe.getElementById("txtCpfAtendimento") !== null;

            if (temCampoLogin) {
              utils.log("Estado: Tela de Login (iframe)", "info");
              window.DrogasilAutomacao.estado = "login";
            } else if (temCampoCpf) {
              utils.log("Estado: Tela de Busca de CPF (iframe)", "info");
              window.DrogasilAutomacao.estado = "busca_cpf";
            } else {
              utils.log(
                "Estado: Outra tela do Terminal Drogasil (iframe)",
                "info"
              );
              window.DrogasilAutomacao.estado = "outra";
            }

            return {
              encontrado: true,
              janela: iframe.contentWindow,
              estado: window.DrogasilAutomacao.estado,
            };
          }
        } catch (e) {
          // Erro ao acessar conteúdo do iframe (geralmente devido a restrições de segurança)
          utils.log(
            `Não foi possível acessar o conteúdo do iframe #${i}: ${e.message}`,
            "erro"
          );
        }
      }

      // Verificar janelas abertas
      utils.log(
        "Não foi possível encontrar o Terminal Drogasil nesta página ou iframes",
        "aviso"
      );
      utils.log(
        "Se você tem o Terminal aberto em outra aba, por favor, execute este script diretamente nessa aba.",
        "aviso"
      );

      window.DrogasilAutomacao.terminalEncontrado = false;

      return {
        encontrado: false,
        mensagem:
          "Terminal Drogasil não encontrado. Execute este script na aba onde o Terminal está aberto.",
      };
    }
  } catch (erro) {
    utils.log(`Erro durante a verificação: ${erro.message}`, "erro");
    console.error(erro);

    return {
      encontrado: false,
      erro: erro.message,
    };
  }
})();
