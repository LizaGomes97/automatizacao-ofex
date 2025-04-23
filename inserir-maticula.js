// Script de Login Terminal Drogasil - Versão Otimizada
(async function () {
  console.clear();
  console.log(
    "%cScript de Login Terminal Drogasil - Versão Otimizada",
    "color: #C41E3A; font-size: 16px; font-weight: bold"
  );

  // Configurações
  const matricula = "309515"; // Matrícula
  const tempoEspera = 1000; // Tempo de espera entre ações (ms)

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
    // 1. Localizar campo de matrícula
    utils.log("Localizando campo de matrícula...", "info");

    // Tentar os dois IDs conhecidos
    let campoMatricula = document.getElementById("txtAtendente");

    if (!campoMatricula) {
      campoMatricula = document.getElementById("txtCpfAtendimento");
    }

    if (!campoMatricula) {
      // Tentar encontrar qualquer campo de entrada visível
      const camposInput = Array.from(
        document.querySelectorAll(
          'input[type="text"], input[type="password"], input:not([type])'
        )
      );
      campoMatricula = camposInput.find((campo) => {
        const estilo = window.getComputedStyle(campo);
        return estilo.display !== "none" && estilo.visibility !== "hidden";
      });
    }

    if (!campoMatricula) {
      throw new Error("Campo de matrícula não encontrado!");
    }

    utils.log(
      `Campo de matrícula encontrado: ${
        campoMatricula.id || campoMatricula.name || "sem id"
      }`,
      "sucesso"
    );

    // 2. Limpar e focar no campo
    utils.log("Focando campo de matrícula...", "info");
    campoMatricula.focus();
    campoMatricula.select();
    campoMatricula.value = "";
    await utils.esperar(500);

    // 3. Preencher a matrícula caractere por caractere
    utils.log(`Preenchendo matrícula: ${matricula}`, "info");

    // Método 1: Preenchimento caractere por caractere com KeyboardEvent
    for (let i = 0; i < matricula.length; i++) {
      // Adicionar o caractere ao valor do campo
      const char = matricula.charAt(i);

      // Simular eventos de teclado para cada caractere
      const keyDownEvent = new KeyboardEvent("keydown", {
        key: char,
        code: `Digit${char}`,
        keyCode: char.charCodeAt(0),
        which: char.charCodeAt(0),
        bubbles: true,
        cancelable: true,
      });

      const inputEvent = new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        data: char,
        inputType: "insertText",
      });

      const keyUpEvent = new KeyboardEvent("keyup", {
        key: char,
        code: `Digit${char}`,
        keyCode: char.charCodeAt(0),
        which: char.charCodeAt(0),
        bubbles: true,
        cancelable: true,
      });

      // Disparar os eventos
      campoMatricula.dispatchEvent(keyDownEvent);
      campoMatricula.value += char;
      campoMatricula.dispatchEvent(inputEvent);
      campoMatricula.dispatchEvent(keyUpEvent);

      // Aguardar entre cada caractere
      await utils.esperar(150);
    }

    // Verificar se a matrícula foi preenchida corretamente
    if (campoMatricula.value !== matricula) {
      utils.log(
        "A matrícula não foi preenchida corretamente. Tentando método alternativo...",
        "aviso"
      );

      // Método 2: Atribuição direta
      campoMatricula.value = matricula;
      campoMatricula.dispatchEvent(new Event("input", { bubbles: true }));
      campoMatricula.dispatchEvent(new Event("change", { bubbles: true }));

      await utils.esperar(tempoEspera);
    }

    utils.log(`Valor atual do campo: "${campoMatricula.value}"`, "info");

    // Disparar eventos finais
    campoMatricula.dispatchEvent(new Event("change", { bubbles: true }));
    campoMatricula.dispatchEvent(new Event("blur", { bubbles: true }));

    // Aguardar para garantir que o campo foi preenchido
    await utils.esperar(tempoEspera);

    // 4. Encontrar e clicar no botão de login
    utils.log("Procurando botão de login...", "info");

    // Tentar várias estratégias para encontrar o botão
    const possiveisIds = [
      "buttonAtendente",
      "buttonAtendenteOK",
      "btnLogin",
      "submitButton",
    ];
    let botaoLogin = null;

    // Buscar por ID
    for (const id of possiveisIds) {
      const botao = document.getElementById(id);
      if (botao) {
        botaoLogin = botao;
        utils.log(`Botão encontrado pelo ID: ${id}`, "sucesso");
        break;
      }
    }

    // Se não encontrou por ID, busca por outros métodos
    if (!botaoLogin) {
      utils.log(
        "Botão não encontrado por ID, tentando outros métodos...",
        "aviso"
      );

      // Buscar por proximidade ao campo
      const rect = campoMatricula.getBoundingClientRect();
      const elementos = document.elementsFromPoint(
        rect.right + 30,
        rect.top + rect.height / 2
      );

      if (elementos && elementos.length > 0) {
        // Filtrar apenas elementos clicáveis
        const clicaveis = elementos.filter(
          (el) =>
            el.tagName === "BUTTON" ||
            el.tagName === "A" ||
            el.tagName === "INPUT" ||
            el.role === "button" ||
            el.style.cursor === "pointer" ||
            getComputedStyle(el).cursor === "pointer"
        );

        if (clicaveis.length > 0) {
          botaoLogin = clicaveis[0];
          utils.log(
            `Botão encontrado por proximidade: ${botaoLogin.tagName}`,
            "sucesso"
          );
        }
      }
    }

    // Se ainda não encontrou, tentar por pesquisa visual
    if (!botaoLogin) {
      utils.log(
        "Botão não encontrado por proximidade, tentando por pesquisa visual...",
        "aviso"
      );

      // Buscar por ícones ou imagens que pareçam um botão de login
      const imagensBotoes = document.querySelectorAll(
        'img[src*="login"], img[src*="enter"], img[src*="arrow"]'
      );
      if (imagensBotoes.length > 0) {
        botaoLogin =
          imagensBotoes[0].closest('button, a, div[role="button"]') ||
          imagensBotoes[0];
        utils.log(
          `Botão encontrado por imagem: ${botaoLogin.tagName}`,
          "sucesso"
        );
      }
    }

    // Se ainda não encontrou, tentar por formulário
    if (!botaoLogin) {
      utils.log("Tentando encontrar formulário para enviar...", "aviso");

      const form = campoMatricula.closest("form");
      if (form) {
        // Encontrar o botão de submit dentro do formulário
        const submitBtn = form.querySelector(
          'button[type="submit"], input[type="submit"]'
        );
        if (submitBtn) {
          botaoLogin = submitBtn;
          utils.log(
            `Botão de submit encontrado no formulário: ${botaoLogin.tagName}`,
            "sucesso"
          );
        } else {
          // Se não encontrou botão de submit, enviar o formulário diretamente
          utils.log(`Formulário encontrado, enviando diretamente...`, "info");

          await utils.esperar(500);
          form.submit();

          utils.log(`Formulário enviado com sucesso!`, "sucesso");
          return;
        }
      }
    }

    // Se encontrou o botão, clicar nele
    if (botaoLogin) {
      // Aguardar um pouco antes de clicar
      await utils.esperar(tempoEspera);

      utils.log(
        `Clicando no botão de login (${botaoLogin.tagName})...`,
        "info"
      );
      botaoLogin.click();

      utils.log(`Clique realizado com sucesso!`, "sucesso");
    } else {
      // Como último recurso, disparar evento Enter no campo
      utils.log(
        "Botão não encontrado. Simulando tecla Enter como último recurso...",
        "aviso"
      );

      await utils.esperar(500);

      campoMatricula.focus();
      const enterEvent = new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true,
      });

      campoMatricula.dispatchEvent(enterEvent);

      utils.log("Evento Enter disparado no campo de matrícula", "info");
    }

    utils.log(
      "Processo de login concluído. Verificando resultado...",
      "sucesso"
    );
  } catch (erro) {
    console.error("Erro durante o processo de login:", erro);
  }
})();
