// src/automacao/puppeteer.js
const puppeteer = require("puppeteer");
const fs = require("fs");

// Configurações básicas
const CONFIG = {
  matricula: "309515", // Substitua pela sua matrícula
  urlSistema: "https://tcdrsil.rd.com.br/portal/tc/default/AtendimentoWindow",
  tempoEspera: 2000, // Tempo de espera entre ações (2 segundos)
  diretorioSaida: "./dados", // Diretório para salvar resultados
  modoDebug: true, // Ativa capturas de tela para debug
};

// Função principal para automatizar a consulta
async function consultarCPF(cpf) {
  console.log(`🔄 Iniciando consulta para CPF: ${cpf}`);

  // Verifica se o diretório de saída existe
  if (!fs.existsSync(CONFIG.diretorioSaida)) {
    fs.mkdirSync(CONFIG.diretorioSaida, { recursive: true });
  }

  // Inicia o navegador
  const browser = await puppeteer.launch({
    headless: false, // Visível durante desenvolvimento (mude para true em produção)
    defaultViewport: { width: 1366, height: 768 },
  });

  try {
    const page = await browser.newPage();

    // Função auxiliar para capturar telas no modo debug
    async function capturarTela(nome) {
      if (CONFIG.modoDebug) {
        await page.screenshot({
          path: `${CONFIG.diretorioSaida}/${nome}-${Date.now()}.png`,
          fullPage: true,
        });
      }
    }

    // 1. Acessar o sistema
    console.log("🌐 Acessando o sistema...");
    await page.goto(CONFIG.urlSistema);
    await capturarTela("01-pagina-inicial");

    // 2. Fazer login com a matrícula
    console.log("🔑 Realizando login...");
    await page.waitForSelector('input[id*="matricula"]');
    await page.type('input[id*="matricula"]', CONFIG.matricula);
    await capturarTela("02-matricula-digitada");

    // Clica no botão de login
    await page.click(
      'button.botao-login, button[id*="login"], button:has-text("→")'
    );
    console.log("✅ Login realizado");

    // Aguarda carregamento da página principal
    await page.waitForTimeout(CONFIG.tempoEspera);
    await capturarTela("03-pagina-principal");

    // 3. Buscar cliente por CPF
    console.log(`🔍 Buscando CPF: ${cpf}...`);
    await page.waitForSelector('input[placeholder*="CPF"], input[id*="cpf"]');
    await page.type('input[placeholder*="CPF"], input[id*="cpf"]', cpf);
    await capturarTela("04-cpf-digitado");

    // Clica no botão de busca
    await page.click(
      'button:near(input[placeholder*="CPF"]), button:has-text("→")'
    );
    await page.waitForTimeout(CONFIG.tempoEspera);
    await capturarTela("05-resultados-busca");

    // 4. Capturar informações do cliente
    console.log("📋 Capturando informações do cliente...");
    const dadosCliente = await page.evaluate(() => {
      // Função executada no contexto do navegador
      const dados = {
        nome: "",
        status: "",
        tipoCliente: "",
      };

      // Tenta obter o nome do cliente
      const elementoNome = document.querySelector(
        ".cliente-item div:first-child"
      );
      if (elementoNome) {
        dados.nome = elementoNome.textContent.trim();
      }

      // Tenta obter o status
      const elementoStatus = document.querySelector(
        ".status-aberto, .status-finalizado"
      );
      if (elementoStatus) {
        dados.status = elementoStatus.textContent.trim();
      }

      // Verifica tipo do cliente
      if (dados.nome.includes("UNIVERS")) {
        dados.tipoCliente = "Univers";
      } else {
        dados.tipoCliente = "Normal";
      }

      return dados;
    });

    console.log("Dados capturados:", dadosCliente);

    // 5. Tenta atender o cliente
    console.log("👤 Atendendo cliente...");
    try {
      await page.click(".btn-atender");
      await page.waitForTimeout(CONFIG.tempoEspera);
      await capturarTela("06-cliente-atendido");
    } catch (e) {
      console.log("⚠️ Não foi possível atender o cliente automaticamente");
    }

    // 6. Solicitar impressão OFEX
    console.log("🖨️ Solicitando impressão...");
    try {
      // Tenta encontrar algum botão ou menu de impressão
      await page.click('button:has-text("Imprimir"), a:has-text("Imprimir")');
      await page.waitForTimeout(CONFIG.tempoEspera);
      await capturarTela("07-impressao-solicitada");
      console.log("✅ Impressão solicitada");
    } catch (e) {
      console.log("⚠️ Não foi possível solicitar impressão automaticamente");
    }

    // 7. Salvar os dados em arquivo
    const nomeArquivo = `${
      CONFIG.diretorioSaida
    }/cliente-${cpf}-${Date.now()}.json`;
    fs.writeFileSync(nomeArquivo, JSON.stringify(dadosCliente, null, 2));
    console.log(`💾 Dados salvos em: ${nomeArquivo}`);

    return dadosCliente;
  } catch (erro) {
    console.error("❌ Erro durante a automação:", erro);
    await capturarTela("erro");
    throw erro;
  } finally {
    // Fechar o navegador ao terminar
    await browser.close();
    console.log("🏁 Automação finalizada");
  }
}

module.exports = { consultarCPF };
