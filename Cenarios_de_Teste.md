# Plano de Testes Funcionais - BioStats (BodyTracker)

Este documento descreve os principais cenários de testes funcionais e fluxos de usuário para garantir a qualidade, estabilidade e precisão do aplicativo de monitoramento de composição corporal.

## 1. Fluxo de Gerenciamento de Clientes

### CT-01: Cadastro de Novo Cliente
*   **Objetivo:** Validar a criação de um novo paciente no banco de dados local.
*   **Pré-requisitos:** Estar na tela inicial (Dashboard do Profissional).
*   **Passos:**
    1. Clicar no botão de adicionar novo cliente.
    2. Preencher os dados obrigatórios: Nome, Data de Nascimento, Sexo (M/F) e Altura (cm).
    3. Salvar o cadastro.
*   **Resultado Esperado:** O cliente deve aparecer na lista da tela inicial. Ao clicar nele, a navegação deve ir para o painel vazio do cliente.

### CT-02: Navegação e Busca de Clientes
*   **Objetivo:** Validar o filtro/busca de pacientes na lista inicial.
*   **Passos:**
    1. Cadastrar 3 clientes com nomes distintos.
    2. Digitar parte do nome de um deles no campo de busca.
*   **Resultado Esperado:** A lista deve ser filtrada em tempo real exibindo apenas o paciente correspondente.

---

## 2. Fluxo de Avaliação Física e Cálculos

### CT-03: Realização de Nova Avaliação (Entrada de Dados)
*   **Objetivo:** Validar se o formulário aceita corretamente as métricas e não permite envio de campos obrigatórios vazios.
*   **Passos:**
    1. Acessar o perfil de um cliente e clicar em "Nova Avaliação".
    2. Deixar "Peso" ou "Cintura" em branco e tentar salvar.
    3. Preencher Peso, Cintura, Nível de Atividade e selecionar "Objetivo Nutricional" (ex: Emagrecimento).
*   **Resultado Esperado:** O formulário deve bloquear o envio com dados faltando. Quando os dados corretos são inseridos, o botão de submissão deve ficar habilitado.

### CT-04: Teste de Upload na Galeria de Evolução
*   **Objetivo:** Confirmar que as imagens carregadas são lidas e reduzidas via `compressImage`.
*   **Passos:**
    1. No formulário de avaliação, rolar até "Galeria de Evolução".
    2. Anexar imagens grandes (ex: 5MB) nos campos de Frente, Lado e Costas.
*   **Resultado Esperado:** O thumbnail da foto deve ser gerado sem travar a interface do usuário. A imagem deve ser comprimida e o estado visualizado corretamente no preview.

### CT-05: Validação do Motor Matemático (Cálculos e Snapshots)
*   **Objetivo:** Validar que os algoritmos de metabolismo e composição corporal estão corretos e atrelados ao cliente.
*   **Passos:**
    1. Salvar a avaliação.
    2. Verificar os detalhes da avaliação recém-criada.
*   **Resultado Esperado:**
    *   Índices como IMC, RCQ, RCEst e Massa Magra (Boer) devem estar preenchidos.
    *   TMB (Katch-McArdle) e Gasto Diário (TDEE) gerados adequadamente.
    *   Macronutrientes sugeridos somando as calorias do objetivo (déficit ou superávit de acordo com o que foi escolhido no dropdown).
    *   Índices Científicos (BAI, BRI e CI) devem ser numéricos (não `NaN` ou `Infinity`).

---

## 3. Visualização e Gráficos (Dashboard do Cliente)

### CT-06: Renderização do Histórico e Gráficos
*   **Objetivo:** Validar a evolução histórica nas chart libraries.
*   **Passos:**
    1. Registrar 3 avaliações consecutivas para o mesmo cliente (com datas ou pesos diferentes).
    2. Acessar o Dashboard do Cliente.
*   **Resultado Esperado:** Os gráficos de Peso, BF e Massa Magra devem exibir pontos sequenciais representando as medições.

### CT-07: Comparativo Fotográfico (Antes e Depois)
*   **Objetivo:** Validar a aba/bloco de comparação visual.
*   **Passos:**
    1. Adicionar uma foto de "Frente" na primeira avaliação.
    2. Adicionar uma foto de "Frente" numa segunda avaliação recente.
    3. Na seleção de detalhes, escolher a avaliação mais recente.
    4. Ir ao painel de "Evolução Visual".
*   **Resultado Esperado:** As imagens "1ª Avaliação" e "Avaliação Atual" devem aparecer lado a lado. A aba deve permitir alternar a visão (Frente, Perfil, Costas) validando se há renderização.

---

## 4. Exportação de Dados

### CT-08: Exportação via WhatsApp
*   **Objetivo:** Validar se os dados extraídos do IndexedDB são formatados para envio ao cliente.
*   **Passos:**
    1. Na visualização dos detalhes de uma avaliação, clicar em "Compartilhar no WhatsApp".
*   **Resultado Esperado:** 
    *   Em desktop/ambiente web: Redirecionar para o `wa.me` contendo o resumo formatado.
    *   No celular: Acionar a Web Share API nativa.
    *   A string gerada deve conter o "Peso Ideal (Devine)", as metas diárias (kcal) e os índices avançados.

### CT-09: Geração de Relatório em PDF
*   **Objetivo:** Validar se a biblioteca converte a interface HTML para um documento contínuo em PDF.
*   **Passos:**
    1. No final do painel do cliente, clicar em "Gerar PDF do Relatório".
*   **Resultado Esperado:** O download deve ser acionado com o nome `relatorio-[nome-do-cliente].pdf`, contendo todas as visualizações (Gráficos, Última Avaliação e Detalhes) de forma legível.

---

## 5. Arquitetura e Testes de Borda (Edge Cases)

### CT-10: Modo Offline e PWA
*   **Objetivo:** Garantir a filosofia Offline-First.
*   **Passos:**
    1. Desligar a conexão de rede no Developer Tools do navegador (Aba Network -> Offline).
    2. Recarregar a página inicial.
    3. Cadastrar um novo cliente e fazer uma avaliação.
*   **Resultado Esperado:** O site deve carregar através dos Service Workers e as transações de banco (Dexie.js) devem fluir instantaneamente sem console errors.

### CT-11: Performance com Base de Dados Grande
*   **Objetivo:** Garantir que o limite de 15 avaliações no Dexie query evita travamentos.
*   **Passos:**
    1. Cadastrar mais de 20 avaliações para um único cliente através de um script automatizado ou testes manuais rápidos.
    2. Abrir o perfil do cliente.
*   **Resultado Esperado:** A interface deve carregar instantaneamente pois os gráficos estão limitados às últimas 15 entradas, e as imagens (Blob/Base64) estão em uma tabela separada e sendo puxadas apenas por Lazy Query no componente visual.
