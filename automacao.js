// automacao.js - Controlador principal da automação

// Configurações da automação
const CONFIG = {
  urlSimulacao: "simulacao-drogasil.html",
  tempoEspera: 1000, // Tempo de espera entre ações (1 segundo)
};

// Classe principal da automação
class AutomacaoDrogasil {
  constructor() {
    // Referência para a janela/aba onde a automação será executada
    this.janelaDrogasil = null;

    // Status da automação
    this.emExecucao = false;

    // Dados da automação
    this.matricula = "";
    this.cpf = "";

    // Elemento para exibir logs
    this.elementoLogs = document.getElementById("logs");
  }

  // Iniciar a automação
  async iniciar(matricula, cpf) {
    try {
      // Verifica se já está em execução
      if (this.emExecucao) {
        this.adicionarLog("⚠️ Uma automação já está em andamento!");
        return false;
      }

      // Validação básica
      if (!matricula || !cpf) {
        this.adicionarLog("❌ Matrícula e CPF são obrigatórios!");
        return false;
      }

      // Define os dados
      this.matricula = matricula;
      this.cpf = cpf;
      this.emExecucao = true;

      // Adiciona log de início
      this.adicionarLog(`🚀 Iniciando automação para CPF: ${cpf}`);

      // Abre a página da Drogasil (simulação)
      await this.abrirPaginaDrogasil();

      // Realiza o login
      await this.fazerLogin();

      // Busca o cliente por CPF
      await this.buscarClientePorCPF();

      // Finaliza a automação
      this.emExecucao = false;
      this.adicionarLog("✅ Automação concluída com sucesso!");
      return true;
    } catch (erro) {
      // Em caso de erro
      this.emExecucao = false;
      this.adicionarLog(`❌ Erro na automação: ${erro.message}`);
      console.error("Erro completo:", erro);
      return false;
    }
  }

  // Abrir a página da Drogasil
  async abrirPaginaDrogasil() {
    this.adicionarLog("🌐 Abrindo página da Drogasil...");

    // Abre a página em uma nova janela/aba
    this.janelaDrogasil = window.open(CONFIG.urlSimulacao, "janelaDrogasil");

    if (!this.janelaDrogasil) {
      throw new Error(
        "Não foi possível abrir a página. Verifique se o bloqueador de pop-ups está desativado."
      );
    }

    // Aguarda a página carregar
    await this.aguardar(CONFIG.tempoEspera * 2);

    this.adicionarLog("✅ Página aberta com sucesso!");
  }

  // Fazer login com a matrícula
  async fazerLogin() {
    this.adicionarLog("🔑 Realizando login...");

    try {
      // Verifica se a janela ainda está disponível
      if (!this.janelaDrogasil || this.janelaDrogasil.closed) {
        throw new Error("A janela da Drogasil foi fechada!");
      }

      // Executa o código na janela da Drogasil
      this.janelaDrogasil.eval(`
          // Busca o campo de matrícula
          const campoMatricula = document.getElementById('matricula');
          
          // Verifica se encontrou o campo
          if (!campoMatricula) {
            throw new Error('Campo de matrícula não encontrado!');
          }
          
          // Preenche o campo com a matrícula
          campoMatricula.value = '${this.matricula}';
          
          // Clica no botão de login
          const botaoLogin = document.getElementById('btnLogin');
          if (botaoLogin) {
            botaoLogin.click();
          } else {
            throw new Error('Botão de login não encontrado!');
          }
        `);

      // Aguarda o processamento
      await this.aguardar(CONFIG.tempoEspera);

      this.adicionarLog("✅ Login realizado com sucesso!");
    } catch (erro) {
      this.adicionarLog(`❌ Erro ao fazer login: ${erro.message}`);
      throw erro;
    }
  }

  // Buscar cliente por CPF
  async buscarClientePorCPF() {
    this.adicionarLog(`🔍 Buscando cliente com CPF: ${this.cpf}...`);

    try {
      // Verifica se a janela ainda está disponível
      if (!this.janelaDrogasil || this.janelaDrogasil.closed) {
        throw new Error("A janela da Drogasil foi fechada!");
      }

      // Executa o código na janela da Drogasil
      this.janelaDrogasil.eval(`
          // Busca o campo de CPF
          const campoCPF = document.getElementById('cpf');
          
          // Verifica se encontrou o campo
          if (!campoCPF) {
            throw new Error('Campo de CPF não encontrado!');
          }
          
          // Preenche o campo com o CPF
          campoCPF.value = '${this.cpf}';
          
          // Clica no botão de busca
          const botaoBuscar = document.getElementById('btnBuscarCpf');
          if (botaoBuscar) {
            botaoBuscar.click();
          } else {
            throw new Error('Botão de busca não encontrado!');
          }
        `);

      // Aguarda o processamento
      await this.aguardar(CONFIG.tempoEspera);

      this.adicionarLog("✅ Busca por CPF realizada com sucesso!");

      // Extrair dados do cliente (opcional)
      this.extrairDadosCliente();
    } catch (erro) {
      this.adicionarLog(`❌ Erro ao buscar cliente: ${erro.message}`);
      throw erro;
    }
  }

  // Extrair dados do cliente
  extrairDadosCliente() {
    try {
      // Verifica se a janela ainda está disponível
      if (!this.janelaDrogasil || this.janelaDrogasil.closed) {
        return;
      }

      // Tenta extrair os dados do cliente
      const dadosCliente = this.janelaDrogasil.eval(`
          // Busca o primeiro cliente da lista
          const clienteItem = document.querySelector('.cliente-item');
          
          if (clienteItem) {
            // Extrai o nome
            const nome = clienteItem.querySelector('div:first-child').textContent;
            
            // Extrai o status
            const status = clienteItem.querySelector('.status-aberto, .status-finalizado').textContent;
            
            // Retorna os dados
            return {
              nome: nome,
              status: status
            };
          } else {
            return null;
          }
        `);

      if (dadosCliente) {
        this.adicionarLog(
          `📋 Dados do cliente: Nome: ${dadosCliente.nome}, Status: ${dadosCliente.status}`
        );
      } else {
        this.adicionarLog("⚠️ Não foi possível extrair dados do cliente.");
      }
    } catch (erro) {
      this.adicionarLog(`⚠️ Erro ao extrair dados do cliente: ${erro.message}`);
    }
  }

  // Função para aguardar
  async aguardar(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Adicionar log
  adicionarLog(mensagem) {
    if (!this.elementoLogs) {
      console.log(mensagem);
      return;
    }

    const data = new Date();
    const horario = `${data.getHours().toString().padStart(2, "0")}:${data
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${data.getSeconds().toString().padStart(2, "0")}`;

    const logItem = document.createElement("div");
    logItem.className = "log-item";
    logItem.innerHTML = `<span class="log-time">[${horario}]</span> ${mensagem}`;

    this.elementoLogs.appendChild(logItem);
    this.elementoLogs.scrollTop = this.elementoLogs.scrollHeight;
  }
}

// Exporta a classe
window.AutomacaoDrogasil = AutomacaoDrogasil;
