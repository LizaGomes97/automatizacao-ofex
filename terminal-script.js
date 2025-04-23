// Função para adicionar log
function adicionarLog(mensagem, tipo = "info") {
  const log = document.getElementById("log");
  const horario = new Date().toLocaleTimeString();

  const entry = document.createElement("div");
  entry.className = `log-entry log-${tipo}`;
  entry.textContent = `[${horario}] ${mensagem}`;

  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;

  // Log no console também para desenvolvedores
  console.log(`[${tipo.toUpperCase()}] ${mensagem}`);
}

// Carregar o terminal
document.getElementById("btnCarregar").addEventListener("click", () => {
  const url = document.getElementById("url").value.trim();

  // Validar a URL
  if (!url) {
    adicionarLog("URL não informada!", "error");
    return;
  }

  adicionarLog(`Iniciando carregamento do terminal: ${url}`, "info");

  // Obter referência ao iframe
  const terminal = document.getElementById("terminal");

  // Adicionar listeners para eventos do iframe
  terminal.addEventListener("load", () => {
    adicionarLog("Iframe carregado com sucesso!", "success");

    // Verificar se podemos acessar o conteúdo do iframe
    try {
      const iframeDoc =
        terminal.contentDocument || terminal.contentWindow.document;
      const title = iframeDoc.title;
      adicionarLog(`Título da página carregada: "${title}"`, "info");

      // Verificar elementos específicos do Terminal Drogasil
      if (iframeDoc.getElementById("txtAtendente")) {
        adicionarLog(
          "Tela de login do Terminal Drogasil detectada (campo matrícula encontrado)",
          "success"
        );
      } else if (iframeDoc.getElementById("txtCpfAtendimento")) {
        adicionarLog("Tela de busca de CPF detectada", "success");
      } else if (iframeDoc.getElementById("oe")) {
        adicionarLog("Tela do cliente com botão OFEX detectada", "success");
      } else {
        adicionarLog(
          "Página carregada, mas elementos do Terminal Drogasil não identificados",
          "warning"
        );
      }

      // Verificar outros detalhes da página (para desenvolvedores)
      adicionarLog(`URL final carregada: ${iframeDoc.location.href}`, "info");
      adicionarLog(`Número de formulários: ${iframeDoc.forms.length}`, "info");
      adicionarLog(
        `Número de botões: ${iframeDoc.querySelectorAll("button").length}`,
        "info"
      );
    } catch (erro) {
      adicionarLog(
        `Erro ao acessar conteúdo do iframe: ${erro.message}`,
        "error"
      );
      adicionarLog(
        "Possível problema de segurança Same-Origin Policy (SOP)",
        "warning"
      );
      adicionarLog("Para depuração, tente a seguinte opção:", "info");
      adicionarLog("1. Abra o console do navegador (F12)", "info");
      adicionarLog("2. Vá até a aba Console", "info");
      adicionarLog(
        "3. Verifique se há mensagens de erro relacionadas ao iframe",
        "info"
      );
    }
  });

  terminal.addEventListener("error", (erro) => {
    adicionarLog(`Erro ao carregar iframe: ${erro}`, "error");
  });

  // Monitorar o estado de carregamento
  adicionarLog("Definindo URL do iframe...", "info");
  terminal.src = url;

  // Verificar estado de carregamento após um tempo
  setTimeout(() => {
    if (!terminal.contentDocument) {
      adicionarLog(
        "Verificação de 5s: O iframe ainda está carregando ou houve bloqueio SOP",
        "warning"
      );
    }
  }, 5000);
});

// Função para limpar o log
document.getElementById("btnLimpar").addEventListener("click", () => {
  document.getElementById("log").innerHTML = "";
  adicionarLog("Log limpo", "info");
});

// Inicialização
adicionarLog("Interface inicializada", "success");
adicionarLog('Clique em "Carregar Terminal" para começar', "info");
adicionarLog(`Navegador detectado: ${navigator.userAgent}`, "info");
