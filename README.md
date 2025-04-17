# Sistema de Automação Drogasil - Terminal e Mobile

Este projeto implementa uma solução para automatizar consultas no sistema Terminal de Consulta da Drogasil, permitindo que colaboradores enviem CPFs de clientes a partir de dispositivos móveis para terminais autorizados na loja.

## Visão Geral

A solução consiste em três componentes principais:

1. **Interface Mobile**: Aplicação web responsiva para dispositivos móveis, onde os colaboradores inserem sua matrícula e os CPFs dos clientes.

2. **Interface do Terminal**: Aplicação para os computadores autorizados da loja, que recebe os CPFs enviados e executa a automação no sistema da Drogasil.

3. **Serviço de Sincronização**: Componente responsável por sincronizar os dados entre os dispositivos móveis e os terminais.

## Estrutura de Arquivos

```
automacao-drogasil/
│
├── mobile.html               # Interface para dispositivos móveis
├── terminal.html             # Interface para o terminal da loja
├── simulacao-drogasil.html   # Simulação do sistema Drogasil para testes
├── sync-service.js           # Serviço de sincronização entre dispositivos
└── README.md                 # Este arquivo
```

## Como Usar

### Configuração do Terminal

1. Abra o arquivo `terminal.html` em um navegador no computador com acesso autorizado ao sistema Drogasil.
2. A interface do terminal será exibida, mostrando a fila de CPFs recebidos.
3. O QR Code exibido pode ser usado pelos colaboradores para acessar a interface móvel.

### Configuração para Colaboradores

1. Escaneie o QR Code exibido no terminal ou acesse diretamente o arquivo `mobile.html` em um navegador móvel.
2. Digite sua matrícula para fazer login.
3. Digite o CPF do cliente que deseja consultar.
4. O CPF será enviado para o terminal e você poderá acompanhar o status da automação.

### Processo de Automação

1. O colaborador envia um CPF a partir do dispositivo móvel.
2. O terminal recebe o CPF e o adiciona à fila.
3. O operador do terminal seleciona o CPF e inicia a automação.
4. O sistema insere automaticamente a matrícula e o CPF no sistema da Drogasil.
5. Os resultados são exibidos no terminal e atualizados na interface móvel.

## Funcionalidades

### Interface Mobile

- Login com matrícula
- Envio de CPFs para o terminal
- Acompanhamento do status da automação
- Verificação da conexão com o terminal

### Interface do Terminal

- Exibição da fila de CPFs recebidos
- Execução da automação no sistema Drogasil
- Visualização de logs detalhados
- Configurações do sistema
- Geração de QR Code para acesso móvel

### Serviço de Sincronização

- Sincronização em tempo real entre dispositivos
- Persistência de dados usando localStorage
- Detecção automática de conexão/desconexão

## Personalizações

### Conectando ao Sistema Real

Para conectar ao sistema real da Drogasil, você precisará:

1. Modificar o código de automação no terminal para apontar para a URL real do sistema:

   - Localize o trecho que abre a simulação no terminal.html
   - Substitua por `simulacaoWindow = window.open('URL_SISTEMA_REAL');`

2. Ajustar os seletores para os elementos da página real:
   - Verifique se os seletores para campos de matrícula e CPF correspondem ao sistema real
   - Atualize-os conforme necessário

### Configurações Avançadas

A interface do terminal oferece várias configurações que podem ser ajustadas:

- **Iniciar automaticamente ao receber CPF**: Inicia a automação assim que um CPF é recebido
- **Imprimir OFEX automaticamente**: Solicita a impressão OFEX automaticamente ao encontrar um cliente
- **Modo Debug**: Ativa a captura de telas durante a automação para depuração
- **Tempo de espera entre ações**: Ajusta o tempo de espera entre as ações de automação

## Requisitos

- Navegadores modernos com suporte a localStorage (Chrome, Firefox, Edge, Safari)
- Acesso ao sistema Terminal de Consulta da Drogasil a partir do computador que executará o terminal
- Conexão de rede entre os dispositivos móveis e o terminal (mesma rede local)

## Limitações

- A sincronização atual usa localStorage, o que limita a comunicação a dispositivos no mesmo navegador
- Para um ambiente de produção, recomenda-se implementar um servidor real com WebSockets ou uma API REST
- A simulação atual não inclui todas as funcionalidades do sistema real da Drogasil

## Próximos Passos

- Implementar um servidor real para sincronização entre dispositivos
- Adicionar suporte para múltiplos terminais
- Implementar autenticação segura para colaboradores
- Adicionar suporte para upload de lista de CPFs em lote
- Desenvolver uma versão nativa para dispositivos móveis

---

_Este projeto foi desenvolvido para facilitar o atendimento aos clientes da Drogasil, permitindo que colaboradores consultem informações de clientes a partir de dispositivos móveis, mesmo com as restrições de segurança do sistema._
