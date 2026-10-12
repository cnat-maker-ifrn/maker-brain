# Documento de Visão 

| Data | Versão | Descrição | Autores |
| :--: | :----: | :-------: | :-----: |
| 05/09/2026 | 1.0 | Versão inicial | Lucas Tales |
| 04/10/2026 | 1.1 | Reestruturação dos Requisitos de Qualidade (ISO/IEC 25010), definição de métricas/operacionalização e detalhamento das restrições do sistema | Lucas Tales |

## 1. Introdução

### 1.1 Objetivo do sistema

O sistema tem como objetivo facilitar o agendamento de visitas, solicitação de serviços e a geração de relatórios para o laboratório CNAT Maker.

### 1.2 Escopo do desenvolvimento do sistema

O sistema permitirá o agendamento de visitas, solicitação de serviços, o gerenciamento de ambos e a geração de relatórios para o laboratório CNAT Maker.

### 1.3 Stakeholders

- Coordenadora do laboratório
- Bolsistas
- Solicitantes

## 2. Visão geral do sistema

### 2.1 Visão e Objetivos do Sistema

O sistema será uma aplicação destinada ao gerenciamento das visitas e solicitações de serviços do laboratório CNAT Maker. A solução busca centralizar essas atividades em um único sistema, reduzindo a necessidade de controles manuais e facilitando o acompanhamento das solicitações.

Os principais objetivos do sistema são:

- Facilitar o agendamento e gerenciamento de visitas ao laboratório;
- Facilitar o registro e gerenciamento de solicitações de serviços;
- Centralizar as informações relacionadas às visitas e solicitações;
- Facilitar o acompanhamento das atividades realizadas pelo laboratório;
- Disponibilizar informações que auxiliem a coordenação e os bolsistas na gestão das atividades;
- Permitir a geração de relatórios relacionados às atividades do laboratório.

### 2.2 Contexto e limite do sistema

O sistema estará inserido no contexto das atividades do laboratório CNAT Maker, envolvendo os processos relacionados ao agendamento de visitas, à solicitação de serviços e ao acompanhamento dessas atividades.

### 2.3 Estrutura geral do sistema

O sistema será organizado de acordo com as principais atividades que serão apoiadas pela solução.

De forma geral, serão consideradas as seguintes partes:

- Gerenciamento de visitas: registro e acompanhamento dos agendamentos realizados pelos solicitantes.
- Gerenciamento de solicitações de serviços: registro e acompanhamento dos serviços solicitados ao laboratório.
- Relatórios: disponibilização de informações consolidadas sobre as atividades do laboratório.

### 2.4 Características do Usuário

|Usuário|Descrição|
|:--|:--|
|Coordenadora|Responsável pela coordenação das atividades do laboratório. Necessita acompanhar e gerenciar as visitas e solicitações de serviços, além de obter informações que auxiliem no acompanhamento das atividades|
|Bolsista|Responsável por auxiliar nas atividades do laboratório. Necessita consultar e gerenciar informações relacionadas às visitas e às solicitações de serviços de acordo com suas responsabilidades|
|Solicitante|Usuário que deseja realizar visitas ou solicitar serviços ao laboratório. Necessita registrar suas solicitações e acompanhar as informações relacionadas às atividades solicitadas|

## 3. Requisitos do sistema

### 3.1 Componentes do sistema

|Componente|Requisito|
|:--|:--|
|Visitas|Agendamento de visitas, Consulta de visitas e Gerenciamento dos agendamentos|
|Serviços|Registro de solicitações, Consulta de solicitações e Gerenciamento das solicitações|
|Relatórios|Geração de relatórios com métricas do laboratório|
|Gerenciamento dos usuários|Identificação dos usuários e controle dos diferentes tipos de acesso|

### 3.2 Requisitos funcionais

|Requisito|Descrição|
|:--|:--|
|RF01|O sistema deve permitir o agendamento de visitas ao laboratório|
|RF02|O sistema deve permitir a consulta dos agendamentos de visitas|
|RF03|O sistema deve permitir o gerenciamento dos agendamentos de visitas|
|RF04|O sistema deve permitir o registro de solicitações de serviços|
|RF05|O sistema deve permitir a consulta das solicitações de serviços.|
|RF06|O sistema deve permitir o gerenciamento das solicitações de serviços|
|RF07|O sistema deve permitir a geração de relatórios com métricas do laboratório|
|RF08|O sistema deve permitir o cadastro de Solicitantes e Bolsistas|
|RF09|O sistema deve permitir gerenciar o cadastro de bolsistas|
|RF10|O sistema deve possuir login|

### 3.3 Requisitos de qualidade (Requisitos Não Funcionais)

| ID | Característica / Subcaracterística | Descrição do Requisito de Qualidade | Tipo de Medição | Métrica / Critério de Aceitação |
|:---|:---|:---|:---|:---|
| **RQ01** | **Eficiência de Desempenho**<br>*(Comportamento temporal)* | As requisições HTTP da API REST devem responder em até 1,5 segundo sob carga típica | Quantitativa | Tempo de resposta da API <= 1500ms |
| **RQ02** | **Eficiência de Desempenho**<br>*(Capacidade)* | O sistema deve suportar no mínimo 50 usuários simultâneos executando consultas na grade de agendamentos e submissões sem degradação do serviço ou aumento significativo na taxa de erros | Quantitativa | Taxa de erros HTTP (status 5xx) < 1%<br> Throughput estável suportando pelo menos 50 conexões concorrentes sustentadas |
| **RQ03** | **Usabilidade**<br>*(Facilidade de Aprendizado)* | Um novo solicitante deve ser capaz de realizar o agendamento de uma visita ou solicitar um serviço de forma autônoma em sua primeira utilização, sem necessidade de treinamento formal prévio. | Mista (Quantitativa e Qualitativa) | Tempo médio para completar a solicitação < 3 minutos |
| **RQ04** | **Segurança**<br>*(Controle de acesso)* | O sistema deve implementar controle de acesso baseado em papéis (RBAC - *Role-Based Access Control*), garantindo que apenas usuários autorizados executem operações de gestão e avaliação, bloqueando acessos indevidos por solicitantes a dados de terceiros | Qualitativa | 100% dos endpoints administrativos protegidos com verificação de perfil, retornando HTTP 403 Forbidden para requisições não autorizadas |

### 3.4 Restrições

| ID | Categoria | Requisito |
|----|-----------|-----------|
| **R01** | Tecnologia do Backend | O backend deve ser desenvolvido em **Python** (versão 3.14 ou superior), utilizando o framework **Django** (versão 6.0 ou superior) e a biblioteca **Django REST Framework (DRF)** para a criação dos serviços da API REST |
| **R02** | Tecnologia do Frontend | O frontend deve ser desenvolvido como uma *Single Page Application* (SPA) utilizando **React** (versão 19 ou superior), ferramenta de build **Vite**, biblioteca **React Router** para roteamento e **Tailwind CSS** (versão 4 ou superior) para estilização dos componentes visuais |
| **R03** | Sistema Gerenciador de Banco de Dados | O SGBD para os ambientes de produção e homologação deve ser obrigatoriamente o **PostgreSQL** (versão 18 ou superior), operando via conector `psycopg2-binary`. O uso do SQLite é restrito exclusivamente ao ambiente de desenvolvimento local |
| **R04** | Formato de Troca de Dados | A comunicação entre frontend e backend deve ser realizada via chamadas HTTP REST, trafegando dados exclusivamente serializados em **JSON**, ressalvadas as rotas específicas para envio de anexos de projetos maker (*multipart/form-data*) |

### 3.5 Interfaces

|Nome da tela|Descrição|
|:--|:--|
|Cadastro de solicitantes|Tela de cadastro para solicitantes|
|Cadastro de bolsistas|Tela de cadastro para bolsistas|
|Gerenciamento de bolsistas|Tela para aceitar ou rejeitar solicitações de cadastro de bolsistas|
|Tela inicial|Tela que permite ao usuário acompanhar suas visitas agendadas e serviços solicitados bem como cadastrar novos|
|Tela de gerenciamento de visitas|Tela que permite aos membros do laboratório gerenciar as visitas|
|Tela de gerenciamento de serviços|Tela que permite aos membros do laboratório gerenciar os serviços|
|Tela de relatórios|Tela que permite ver métricas do laboratório bem como gerar um relatório em pdf|

## Referências

- ISO/IEC 25010
- IREB — *Certified Professional for Requirements Engineering (CPRE) — Foundation Level*.
