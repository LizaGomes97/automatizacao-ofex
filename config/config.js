// config/config.js
// Configurações da aplicação

module.exports = {
  // Sistema Drogasil
  sistema: {
    url: "https://tcdrsil.rd.com.br/portal/tc/default/AtendimentoWindow",
    matricula: "123456", // Substitua pela sua matrícula real
    timeoutPadrao: 10000, // 10 segundos
  },

  // Automação
  automacao: {
    modoDebug: true,
    headless: false, // Mude para true em produção
    tempoEspera: 2000, // 2 segundos entre ações
    diretorioSaida: "./dados",
  },
};
