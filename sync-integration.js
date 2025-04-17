// sync-integration.js - Integração do serviço de sincronização com as interfaces

/**
 * Este arquivo demonstra como integrar o serviço de sincronização
 * com as interfaces mobile e terminal
 */

// ------------------- Código para a Interface Mobile -------------------

// Quando a página carregar
document.addEventListener("DOMContentLoaded", function () {
  // Inicializa o serviço de sincronização (dispositivo móvel)
  const syncService = new SyncService();

  // Elementos da interface
  const terminalStatus = document.getElementById("terminalStatus");
  const btnEnviarCpf = document.getElementById("btnEnviarCpf");
  const statusLogs = document.getElementById("statusLogs");
  const consultaStatus = document.getElementById("consultaStatus");

  // Evento: Terminal conectado
  syncService.on("connected", function (data) {
    terminalStatus.textContent = "Terminal conectado e pronto";
    terminalStatus.className = "message success";

    // Habilita o botão de enviar CPF
    btnEnviarCpf.disabled = false;
  });

  // Evento: Terminal desconectado
  syncService.on("disconnected", function () {
    terminalStatus.textContent = "Terminal não conectado";
    terminalStatus.className = "message error";

    // Desabilita o botão de enviar CPF
    btnEnviarCpf.disabled = true;
  });

  // Evento: Status atualizado
  syncService.on("statusUpdate", function (message) {
    // Limpa logs existentes
    statusLogs.innerHTML = "";

    // Adiciona mensagem baseada no status
    if (message.status === "processing") {
      consultaStatus.textContent = "Processando consulta...";
      consultaStatus.className = "message info";

      // Adiciona logs específicos do processamento
      if (message.details && message.details.logs) {
        message.details.logs.forEach((log) => {
          addStatusLog(log.message);
        });
      }
    } else if (message.status === "completed") {
      consultaStatus.textContent = "Consulta concluída com sucesso!";
      consultaStatus.className = "message success";

      // Adiciona mensagens de sucesso
      addStatusLog("Cliente encontrado com sucesso!");

      if (message.details && message.details.cliente) {
        const cliente = message.details.cliente;
        addStatusLog(`Nome: ${cliente.nome}`);
        addStatusLog(`Status: ${cliente.status}`);
        addStatusLog(`Tipo: ${cliente.tipo}`);
      }
    } else if (message.status === "error") {
      consultaStatus.textContent =
        "Falha na consulta. Verifique os detalhes abaixo.";
      consultaStatus.className = "message error";

      // Adiciona mensagem de erro
      if (message.details && message.details.error) {
        addStatusLog(`Erro: ${message.details.error}`);
      } else {
        addStatusLog("Ocorreu um erro na automação");
      }
    }
  });

  // Função para adicionar log de status
  function addStatusLog(message) {
    const now = new Date();
    const time = now.toLocaleTimeString();

    const logItem = document.createElement("div");
    logItem.className = "status-item";
    logItem.innerHTML = `
            <div class="status-time">${time}</div>
            <div class="status-message">${message}</div>
        `;

    statusLogs.appendChild(logItem);
  }

  // Formulário de login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const matricula = document.getElementById("matricula").value.trim();

      // Define a matrícula no serviço
      syncService.setMatricula(matricula);

      // Continua com o fluxo normal da interface
      // ...
    });
  }

  // Formulário de CPF
  const cpfForm = document.getElementById("cpfForm");
  if (cpfForm) {
    cpfForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const cpf = document.getElementById("cpf").value.trim();

      // Envia o CPF pelo serviço de sincronização
      const messageId = syncService.sendCPF(cpf);

      if (messageId) {
        // Adiciona um log inicial
        consultaStatus.textContent = "Aguardando processamento...";
        consultaStatus.className = "message info";
        addStatusLog("CPF enviado para o terminal");

        // Muda para a tela de status (código específico da interface)
        // ...
      }
    });
  }
});

// ------------------- Código para a Interface Terminal -------------------

// Quando a página carregar
document.addEventListener("DOMContentLoaded", function () {
  // Inicializa o serviço de sincronização (terminal)
  const syncService = new SyncService().setAsTerminal();

  // Elementos da interface
  const queueContainer = document.getElementById("queueContainer");
  const systemLogs = document.getElementById("systemLogs");
  const automacaoLogs = document.getElementById("automacaoLogs");

  // Estado da interface
  let currentCpfId = null;

  // Evento: Novo CPF recebido
  syncService.on("cpfReceived", function (message) {
    // Adiciona log ao sistema
    addSystemLog(
      `CPF recebido: ${message.cpf} (Matrícula: ${message.matricula})`,
      "info"
    );

    // Verifica se o CPF já está na fila visual
    const existingItem = document.querySelector(
      `[data-cpf-id="${message.id}"]`
    );
    if (existingItem) {
      return;
    }

    // Adiciona o CPF à fila visual
    addCpfToQueue(message);

    // Se a configuração de iniciar automaticamente estiver ativada
    const autoStart = document.getElementById("settingAutoStart");
    if (autoStart && autoStart.checked) {
      // Inicia automaticamente para o primeiro CPF da fila
      const firstItem = document.querySelector(
        ".queue-item:not(.queue-item-processed)"
      );
      if (firstItem) {
        firstItem.click(); // Seleciona o item
        document.getElementById("btnIniciarAutomacao").click(); // Inicia a automação
      }
    }
  });

  // Função para adicionar CPF à fila visual
  function addCpfToQueue(message) {
    // Remove mensagem de fila vazia, se existir
    const emptyQueue = queueContainer.querySelector(
      'div[style*="text-align: center"]'
    );
    if (emptyQueue) {
      emptyQueue.remove();
    }

    // Formata o CPF para exibição
    const cpfFormatado = message.cpf.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      "$1.$2.$3-$4"
    );

    // Cria o item da fila
    const queueItem = document.createElement("div");
    queueItem.className = "queue-item";
    queueItem.setAttribute("data-cpf-id", message.id);
    queueItem.setAttribute("data-cpf", message.cpf);
    queueItem.setAttribute("data-matricula", message.matricula);
    queueItem.innerHTML = `
            <div><strong>CPF:</strong> ${cpfFormatado}</div>
            <div class="queue-item-details">
                <span>Matrícula: ${message.matricula}</span>
                <span>${new Date(message.timestamp).toLocaleTimeString()}</span>
            </div>
        `;

    // Adiciona o evento de clique para selecionar o CPF
    queueItem.addEventListener("click", function () {
      // Remove a classe ativa de todos os itens
      document.querySelectorAll(".queue-item").forEach((item) => {
        item.classList.remove("queue-item-active");
      });

      // Adiciona a classe ativa ao item clicado
      this.classList.add("queue-item-active");

      // Atualiza o ID do CPF atual
      currentCpfId = this.getAttribute("data-cpf-id");

      // Atualiza o painel de informações do CPF
      const cpf = this.getAttribute("data-cpf");
      const matricula = this.getAttribute("data-matricula");
      const time = new Date(message.timestamp).toLocaleTimeString();

      // Atualiza a exibição de informações do CPF selecionado
      const selectedCpfInfo = document.getElementById("selectedCpfInfo");
      const noCpfSelected = document.getElementById("noCpfSelected");

      if (selectedCpfInfo && noCpfSelected) {
        selectedCpfInfo.innerHTML = `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                        <div>
                            <strong>CPF:</strong> ${cpfFormatado}
                        </div>
                        <div>
                            <strong>Matrícula:</strong> ${matricula}
                        </div>
                        <div>
                            <strong>Horário:</strong> ${time}
                        </div>
                    </div>
                    
                    <div class="action-row">
                        <button class="btn-primary" id="btnIniciarAutomacao">
                            <span class="btn-icon">▶️</span> Iniciar Automação
                        </button>
                        <button class="btn-secondary" id="btnRemoverCpf">
                            <span class="btn-icon">❌</span> Remover
                        </button>
                    </div>
                `;

        selectedCpfInfo.classList.remove("hidden");
        noCpfSelected.classList.add("hidden");

        // Recria os listeners de eventos para os botões
        document
          .getElementById("btnIniciarAutomacao")
          .addEventListener("click", iniciarAutomacaoCPF);
        document
          .getElementById("btnRemoverCpf")
          .addEventListener("click", removerCPFDaFila);
      }
    });

    // Adiciona o item à fila
    queueContainer.prepend(queueItem);
  }

  // Função para iniciar a automação para o CPF selecionado
  function iniciarAutomacaoCPF() {
    if (!currentCpfId) {
      addSystemLog("Nenhum CPF selecionado!", "error");
      return;
    }

    // Obtém os dados do CPF atual
    const item = document.querySelector(`[data-cpf-id="${currentCpfId}"]`);
    if (!item) {
      addSystemLog("CPF não encontrado na fila!", "error");
      return;
    }

    const cpf = item.getAttribute("data-cpf");
    const matricula = item.getAttribute("data-matricula");

    // Atualiza o status visual
    document.getElementById("nenhumaAutomacao").classList.add("hidden");
    document.getElementById("automacaoEmAndamento").classList.remove("hidden");
    document.getElementById("automacaoConcluida").classList.add("hidden");
    document.getElementById("automacaoErro").classList.add("hidden");

    // Limpa os logs anteriores
    automacaoLogs.innerHTML = "";

    // Adiciona logs iniciais
    addAutomacaoLog(`Iniciando automação para CPF: ${cpf}`);

    // Atualiza o status no serviço de sincronização
    syncService.updateCPFStatus(currentCpfId, "processing", {
      logs: [
        {
          timestamp: Date.now(),
          message: `Iniciando automação para CPF: ${cpf}`,
        },
      ],
    });

    // Aqui seria chamada a automação real
    // Por enquanto, simularemos o processo
    simularAutomacao(cpf, matricula);
  }

  // Função para simular o processo de automação
  function simularAutomacao(cpf, matricula) {
    const logs = [];

    // Função para adicionar log e atualizar status
    function addLogAndUpdate(message, delay) {
      setTimeout(() => {
        addAutomacaoLog(message);
        logs.push({ timestamp: Date.now(), message: message });

        // Atualiza o status no serviço
        syncService.updateCPFStatus(currentCpfId, "processing", { logs: logs });
      }, delay);
    }

    // Simula o processo de automação com atrasos
    addLogAndUpdate("Abrindo navegador automatizado", 1000);
    addLogAndUpdate("Acessando sistema Drogasil", 2000);
    addLogAndUpdate(`Realizando login com matrícula: ${matricula}`, 3000);
    addLogAndUpdate("Login realizado com sucesso", 4000);
    addLogAndUpdate(`Buscando cliente por CPF: ${cpf}`, 5000);

    // Simula um resultado aleatório (sucesso ou erro)
    const success = Math.random() > 0.2; // 80% de chance de sucesso

    if (success) {
      // Simulação de sucesso
      setTimeout(() => {
        addAutomacaoLog("Cliente encontrado: João da Silva");
        logs.push({
          timestamp: Date.now(),
          message: "Cliente encontrado: João da Silva",
        });

        addAutomacaoLog("Status do cliente: Em aberto");
        logs.push({
          timestamp: Date.now(),
          message: "Status do cliente: Em aberto",
        });

        addAutomacaoLog("Automação concluída com sucesso");
        logs.push({
          timestamp: Date.now(),
          message: "Automação concluída com sucesso",
        });

        // Atualiza a interface
        document.getElementById("automacaoEmAndamento").classList.add("hidden");
        document
          .getElementById("automacaoConcluida")
          .classList.remove("hidden");

        // Preenche os dados do cliente
        document.getElementById("resultadoNome").textContent = "João da Silva";
        document.getElementById("resultadoStatus").textContent = "Em aberto";
        document.getElementById("resultadoTipo").textContent = "Normal";

        // Marca o item como processado
        const item = document.querySelector(`[data-cpf-id="${currentCpfId}"]`);
        if (item) {
          item.classList.add("queue-item-processed");
        }

        // Atualiza o status no serviço
        syncService.updateCPFStatus(currentCpfId, "completed", {
          cliente: {
            nome: "João da Silva",
            status: "Em aberto",
            tipo: "Normal",
          },
          logs: logs,
        });

        // Adiciona log ao sistema
        addSystemLog(`Automação concluída para CPF: ${cpf}`, "success");

        // Verifica se deve imprimir automaticamente
        const autoPrint = document.getElementById("settingAutoPrint");
        if (autoPrint && autoPrint.checked) {
          document.getElementById("btnImprimirOFEX").click();
        }
      }, 6000);
    } else {
      // Simulação de erro
      setTimeout(() => {
        addAutomacaoLog("Erro: Cliente não encontrado para o CPF informado");
        logs.push({
          timestamp: Date.now(),
          message: "Erro: Cliente não encontrado para o CPF informado",
        });

        // Atualiza a interface
        document.getElementById("automacaoEmAndamento").classList.add("hidden");
        document.getElementById("automacaoErro").classList.remove("hidden");

        // Define a mensagem de erro
        document.getElementById("resultadoErro").textContent =
          "Cliente não encontrado para o CPF informado.";

        // Atualiza o status no serviço
        syncService.updateCPFStatus(currentCpfId, "error", {
          error: "Cliente não encontrado para o CPF informado",
          logs: logs,
        });

        // Adiciona log ao sistema
        addSystemLog(`Erro na automação para CPF: ${cpf}`, "error");
      }, 6000);
    }
  }

  // Função para remover CPF da fila
  function removerCPFDaFila() {
    if (!currentCpfId) {
      return;
    }

    // Obtém o item
    const item = document.querySelector(`[data-cpf-id="${currentCpfId}"]`);
    if (!item) {
      return;
    }

    const cpf = item.getAttribute("data-cpf");

    // Remove o item da fila
    item.remove();

    // Limpa a seleção atual
    currentCpfId = null;

    // Atualiza a interface
    document.getElementById("selectedCpfInfo").classList.add("hidden");
    document.getElementById("noCpfSelected").classList.remove("hidden");

    // Verifica se a fila está vazia
    if (queueContainer.querySelectorAll(".queue-item").length === 0) {
      queueContainer.innerHTML =
        '<div style="text-align: center; padding: 20px; color: #666;">Fila vazia</div>';
    }

    // Adiciona log ao sistema
    addSystemLog(`CPF removido da fila: ${cpf}`, "info");
  }

  // Função para adicionar log de automação
  function addAutomacaoLog(message) {
    const now = new Date();
    const time = now.toLocaleTimeString();

    const logItem = document.createElement("div");
    logItem.className = "log-item";
    logItem.innerHTML = `<span class="log-time">[${time}]</span> <span>${message}</span>`;

    automacaoLogs.appendChild(logItem);
    automacaoLogs.scrollTop = automacaoLogs.scrollHeight;
  }

  // Função para adicionar log ao sistema
  function addSystemLog(message, type = "info") {
    const now = new Date();
    const time = now.toLocaleTimeString();

    const logItem = document.createElement("div");
    logItem.className = "log-item";
    logItem.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-${type}">${message}</span>`;

    systemLogs.appendChild(logItem);
    systemLogs.scrollTop = systemLogs.scrollHeight;
  }

  // Configura os botões da interface

  // Botão limpar fila
  const btnClearQueue = document.getElementById("btnClearQueue");
  if (btnClearQueue) {
    btnClearQueue.addEventListener("click", function () {
      if (confirm("Tem certeza que deseja limpar toda a fila?")) {
        // Limpa a fila visual
        queueContainer.innerHTML =
          '<div style="text-align: center; padding: 20px; color: #666;">Fila vazia</div>';

        // Limpa a fila no serviço
        syncService.clearCPFQueue();

        // Limpa a seleção atual
        currentCpfId = null;

        // Atualiza a interface
        document.getElementById("selectedCpfInfo").classList.add("hidden");
        document.getElementById("noCpfSelected").classList.remove("hidden");

        // Adiciona log ao sistema
        addSystemLog("Fila de CPFs limpa pelo usuário", "info");
      }
    });
  }

  // Botões de finalização
  const btnFinalizarAutomacao = document.getElementById(
    "btnFinalizarAutomacao"
  );
  if (btnFinalizarAutomacao) {
    btnFinalizarAutomacao.addEventListener("click", function () {
      document.getElementById("automacaoConcluida").classList.add("hidden");
      document.getElementById("nenhumaAutomacao").classList.remove("hidden");
    });
  }

  const btnFinalizarErro = document.getElementById("btnFinalizarErro");
  if (btnFinalizarErro) {
    btnFinalizarErro.addEventListener("click", function () {
      document.getElementById("automacaoErro").classList.add("hidden");
      document.getElementById("nenhumaAutomacao").classList.remove("hidden");
    });
  }

  // Botão impressão OFEX
  const btnImprimirOFEX = document.getElementById("btnImprimirOFEX");
  if (btnImprimirOFEX) {
    btnImprimirOFEX.addEventListener("click", function () {
      alert("Solicitação de impressão OFEX enviada com sucesso!");

      // Adiciona log ao sistema
      addSystemLog(
        "Impressão OFEX solicitada para cliente: João da Silva",
        "success"
      );
    });
  }

  // Outros botões e funcionalidades podem ser adicionados aqui

  // Adiciona log inicial
  addSystemLog("Serviço de sincronização inicializado", "info");
  addSystemLog("Aguardando conexões de dispositivos móveis", "info");

  // Atualiza o status da conexão periodicamente
  setInterval(() => {
    const activeInstances = syncService.getActiveInstances();
    const mobileInstances = activeInstances.filter(
      (instance) => instance.type !== "terminal"
    );

    const statusIndicator = document.querySelector(".status-indicator");
    if (mobileInstances.length > 0) {
      statusIndicator.className = "status-indicator online";
      statusIndicator.innerHTML = `<div class="indicator-dot"></div> Online (${
        mobileInstances.length
      } dispositivo${mobileInstances.length > 1 ? "s" : ""})`;
    } else {
      statusIndicator.className = "status-indicator offline";
      statusIndicator.innerHTML =
        '<div class="indicator-dot"></div> Offline (nenhum dispositivo)';
    }
  }, 5000);
});
