# Documento de Visão 

| Data | Versão | Descrição | Autores |
| :--: | :----: | :-------: | :-----: |
| 05/09/2026 | 1.0 | Versão inicial | Lucas Tales |

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

### 3.1 Por subsistema/componente

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

### 3.3 Requisitos de qualidade

|Requisito|Descrição|
|:--|:--|
|RQ01|O sistema deverá carregar as páginas em até 3 segundos|
|RQ02|O sistema deverá apresentar uma disponibilidade mínima de 95% durante cada mês, exceto durante períodos de manutenção previamente programados|
|RQ03|O sistema deverá permitir que um usuário realize um agendamento de visita sem necessidade de treinamento prévio, utilizando uma interface com campos e opções claramente identificados|

### 3.4 Restrições

|Restrição|Descrição|
|:--|:--|
|R01|O banco de dados será PostgreSQL|
|R02|O backend será feito com Django REST Framework|
|R03|O frontend será feito com Vite, React e TailwindCSS|

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

Certified Professional for Requirements Engineering
