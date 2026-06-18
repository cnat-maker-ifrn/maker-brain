# MakerApp
Sistema de agendamento do laboratório Cnat Maker

## QuickStart
Tutorial rápido para inicializar o projeto

### **Importante!**
Para que o tutorial funcione você precisa ter o **Python** na versão 3.12 ou superior instalado na sua máquina. Além disso, também é necessário ter o arquivo **.env** (disponível no Google Drive do projeto) com as variáveis de ambiente devidamente configuradas, no diretório que contém o arquivo **manage.py**.

### 1. Crie um ambiente virutal e ative-o (opcional)
Para isolar suas dependências e evitar conflitos é recomendado criar um ambiente virtual, para fazer isso rode o seguinte comando:

    python -m venv venv

#### Para ativá-lo, o comando vai variar dependendo do seu sistema operacional:

##### Windows

    venv\Scripts\activate

Obs.: Caso receba um erro de script bloqueado no PowerShell, execute o comando a seguir e tente novamente:

    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

##### Linux e MacOS

    source venv/bin/activate

#### Para desativar basta rodar o comando:

    deactivate

### 2. Baixe as dependências
Estando no diretório que contem o arquivo **requirements.txt** e com o ambiente virtual ativado (caso você o tenha feito), rode o seguinte comando no terminal:

    pip install -r requirements.txt

### 3. Realize as migrações
Estando no diretório que contem o arquivo **manage.py**, rode o seguinte comando no terminal:

    python manage.py migrate

### 4. Rode o projeto
Ainda no diretório da etapa anterior, rode o seguinte comando no terminal:

    python manage.py runserver

---
© 2026 CNAT MAKER - IFRN Campus Natal Central. Todos os direitos reservados.
