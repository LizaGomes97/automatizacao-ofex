// sync-service.js - Serviço de sincronização entre terminal e dispositivos móveis
// Este código simula um serviço básico de sincronização usando armazenamento local
// Em um ambiente real, você usaria WebSockets ou uma API REST

class SyncService {
  constructor() {
    // Prefixo para chaves no localStorage
    this.keyPrefix = "drogasil_sync_";

    // ID único para esta instância do serviço
    this.instanceId = this.generateUUID();

    // Status da conexão
    this.isTerminal = false; // Define se esta instância é um terminal ou um dispositivo móvel

    // Intervalo para verificar atualizações
    this.pollingInterval = null;

    // Lista de callbacks para eventos
    this.eventListeners = {
      cpfReceived: [],
      statusUpdate: [],
      connected: [],
      disconnected: [],
    };

    // Inicia a verificação automática
    this.initialize();
  }

  // Inicializa o serviço
  initialize() {
    console.log(`Serviço de sincronização inicializado: ID ${this.instanceId}`);

    // Verifica por mensagens a cada 2 segundos
    this.pollingInterval = setInterval(() => {
      this.checkForUpdates();
    }, 2000);

    // Registra esta instância como ativa
    this.registerInstance();
  }

  // Registra esta instância no sistema
  registerInstance() {
    // Obtém a lista de instâncias ativas
    const activeInstances = this.getActiveInstances();

    // Adiciona esta instância
    activeInstances.push({
      id: this.instanceId,
      type: this.isTerminal ? "terminal" : "mobile",
      lastSeen: new Date().getTime(),
      matricula: this.isTerminal
        ? null
        : localStorage.getItem(`${this.keyPrefix}matricula`) || null,
    });

    // Salva a lista atualizada
    localStorage.setItem(
      `${this.keyPrefix}instances`,
      JSON.stringify(activeInstances)
    );
  }

  // Atualiza o timestamp da última vez que esta instância foi vista
  updateLastSeen() {
    // Obtém a lista de instâncias ativas
    const activeInstances = this.getActiveInstances();

    // Encontra esta instância
    const instance = activeInstances.find(
      (instance) => instance.id === this.instanceId
    );

    if (instance) {
      // Atualiza o timestamp
      instance.lastSeen = new Date().getTime();

      // Atualiza a matrícula se for um dispositivo móvel
      if (!this.isTerminal) {
        instance.matricula =
          localStorage.getItem(`${this.keyPrefix}matricula`) || null;
      }

      // Salva a lista atualizada
      localStorage.setItem(
        `${this.keyPrefix}instances`,
        JSON.stringify(activeInstances)
      );
    } else {
      // Se a instância não estiver na lista, registra novamente
      this.registerInstance();
    }
  }

  // Obtém a lista de instâncias ativas (remove as inativas)
  getActiveInstances() {
    const now = new Date().getTime();
    const maxAge = 60000; // 1 minuto

    // Obtém a lista salva
    const savedInstances = localStorage.getItem(`${this.keyPrefix}instances`);
    let instances = [];

    if (savedInstances) {
      try {
        instances = JSON.parse(savedInstances);
      } catch (e) {
        console.error("Erro ao analisar instâncias:", e);
      }
    }

    // Filtra instâncias inativas (não vistas há mais de 1 minuto)
    return instances.filter((instance) => now - instance.lastSeen < maxAge);
  }

  // Configura este cliente como um terminal
  setAsTerminal() {
    this.isTerminal = true;

    // Atualiza o registro
    const activeInstances = this.getActiveInstances();
    const instance = activeInstances.find(
      (instance) => instance.id === this.instanceId
    );

    if (instance) {
      instance.type = "terminal";
      instance.lastSeen = new Date().getTime();
      localStorage.setItem(
        `${this.keyPrefix}instances`,
        JSON.stringify(activeInstances)
      );
    } else {
      this.registerInstance();
    }

    return this;
  }

  // Configura a matrícula do usuário (para dispositivos móveis)
  setMatricula(matricula) {
    localStorage.setItem(`${this.keyPrefix}matricula`, matricula);

    // Atualiza o registro
    this.updateLastSeen();

    return this;
  }

  // Envia um CPF do dispositivo móvel para o terminal
  sendCPF(cpf) {
    if (this.isTerminal) {
      console.error("Terminais não podem enviar CPFs");
      return false;
    }

    const matricula = localStorage.getItem(`${this.keyPrefix}matricula`);

    if (!matricula) {
      console.error("Matrícula não definida");
      return false;
    }

    // Cria o objeto da mensagem
    const message = {
      type: "cpf",
      cpf: cpf,
      matricula: matricula,
      timestamp: new Date().getTime(),
      status: "pending",
      id: this.generateUUID(),
      sender: this.instanceId,
    };

    // Obtém a fila de CPFs
    const cpfQueue = this.getCPFQueue();

    // Adiciona a mensagem à fila
    cpfQueue.push(message);

    // Salva a fila atualizada
    localStorage.setItem(
      `${this.keyPrefix}cpf_queue`,
      JSON.stringify(cpfQueue)
    );

    console.log(`CPF enviado: ${cpf} (Matrícula: ${matricula})`);

    return message.id;
  }

  // Atualiza o status de um CPF (para terminais)
  updateCPFStatus(messageId, status, details = null) {
    if (!this.isTerminal) {
      console.error("Apenas terminais podem atualizar o status dos CPFs");
      return false;
    }

    // Obtém a fila de CPFs
    const cpfQueue = this.getCPFQueue();

    // Encontra a mensagem
    const message = cpfQueue.find((msg) => msg.id === messageId);

    if (!message) {
      console.error(`Mensagem não encontrada: ${messageId}`);
      return false;
    }

    // Atualiza o status
    message.status = status;
    message.lastUpdated = new Date().getTime();

    // Adiciona detalhes, se fornecidos
    if (details) {
      message.details = details;
    }

    // Salva a fila atualizada
    localStorage.setItem(
      `${this.keyPrefix}cpf_queue`,
      JSON.stringify(cpfQueue)
    );

    console.log(`Status do CPF atualizado: ${message.cpf} (${status})`);

    return true;
  }

  // Obtém a fila de CPFs
  getCPFQueue() {
    const savedQueue = localStorage.getItem(`${this.keyPrefix}cpf_queue`);
    let queue = [];

    if (savedQueue) {
      try {
        queue = JSON.parse(savedQueue);
      } catch (e) {
        console.error("Erro ao analisar fila de CPFs:", e);
      }
    }

    return queue;
  }

  // Verifica por atualizações
  checkForUpdates() {
    // Atualiza o timestamp desta instância
    this.updateLastSeen();

    // Verifica por CPFs na fila
    if (this.isTerminal) {
      // Terminais buscam por novos CPFs
      const cpfQueue = this.getCPFQueue();
      const pendingCPFs = cpfQueue.filter((msg) => msg.status === "pending");

      pendingCPFs.forEach((message) => {
        // Dispara o evento cpfReceived para cada CPF pendente
        this.trigger("cpfReceived", message);
      });
    } else {
      // Dispositivos móveis verificam atualizações de status
      const matricula = localStorage.getItem(`${this.keyPrefix}matricula`);

      if (matricula) {
        const cpfQueue = this.getCPFQueue();
        const matriculaCPFs = cpfQueue.filter(
          (msg) => msg.matricula === matricula && msg.sender === this.instanceId
        );

        matriculaCPFs.forEach((message) => {
          // Dispara o evento statusUpdate para cada atualização de status
          if (
            message.lastUpdated &&
            message.lastUpdated > (message.lastNotified || 0)
          ) {
            this.trigger("statusUpdate", message);

            // Atualiza o timestamp da última notificação
            message.lastNotified = new Date().getTime();
          }
        });

        // Salva a fila atualizada com os timestamps de notificação
        localStorage.setItem(
          `${this.keyPrefix}cpf_queue`,
          JSON.stringify(cpfQueue)
        );
      }
    }

    // Verifica se há terminais ativos (para dispositivos móveis)
    if (!this.isTerminal) {
      const activeInstances = this.getActiveInstances();
      const activeTerminals = activeInstances.filter(
        (instance) => instance.type === "terminal"
      );

      const isTerminalConnected = activeTerminals.length > 0;
      const wasTerminalConnected = this.terminalConnected || false;

      if (isTerminalConnected && !wasTerminalConnected) {
        // Terminal conectado
        this.trigger("connected", { terminals: activeTerminals });
        this.terminalConnected = true;
      } else if (!isTerminalConnected && wasTerminalConnected) {
        // Terminal desconectado
        this.trigger("disconnected", {});
        this.terminalConnected = false;
      }
    }
  }

  // Registra callback para eventos
  on(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].push(callback);
    }

    return this;
  }

  // Dispara um evento
  trigger(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach((callback) => {
        try {
          callback(data);
        } catch (e) {
          console.error(`Erro ao executar callback para evento ${event}:`, e);
        }
      });
    }
  }

  // Limpa a fila de CPFs
  clearCPFQueue() {
    localStorage.setItem(`${this.keyPrefix}cpf_queue`, JSON.stringify([]));
    console.log("Fila de CPFs limpa");

    return this;
  }

  // Gera um UUID
  generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  // Finaliza o serviço
  finalize() {
    // Cancela o intervalo de verificação
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    // Remove esta instância da lista
    const activeInstances = this.getActiveInstances();
    const filteredInstances = activeInstances.filter(
      (instance) => instance.id !== this.instanceId
    );
    localStorage.setItem(
      `${this.keyPrefix}instances`,
      JSON.stringify(filteredInstances)
    );

    console.log("Serviço de sincronização finalizado");
  }
}

// Exporta a classe
window.SyncService = SyncService;
