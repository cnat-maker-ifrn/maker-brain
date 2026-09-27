# CDU002. Solicitar serviços

- **Ator principal**: Solicitante
- **Resumo**: O solicitante registra um pedido de prestação de serviços técnicos (impressão 3D, corte a laser ou estampagem) ao laboratório CNAT Maker, informando a quantidade, descrição e anexando o arquivo do projeto.
- **Pré-condição**: O solicitante está autenticado no sistema.
- **Pós-condição**: A solicitação de serviço é gravada com status "Aguardando avaliação", o arquivo é salvo e o pedido fica visível na listagem de serviços do solicitante e para os membros do laboratório.

## Fluxo Principal – Solicitação de serviço com sucesso
| Ações do ator | Ações do sistema |
| :-----------------: | :-----------------: |
| 1 - Na tela inicial, clica no botão "Solicitar serviço" | |
| | 2 - Exibe o formulário de cadastro de serviço contendo tipo de serviço, quantidade, descrição e envio de arquivo |
| 3 - Seleciona o tipo de serviço (Impressão 3D, Corte a Laser ou Estampagem) | |
| 4 - Informa a quantidade desejada de peças | |
| 5 - Preenche o campo de descrição detalhando as necessidades do serviço | |
| 6 - Seleciona o arquivo do projeto no seu dispositivo (.stl, .obj, .jpg, .jpeg, .png) | |
| 7 - Clica no botão "Solicitar serviço" | |
| | 8 - Valida as informações informadas (quantidade maior que zero, formato do arquivo e preenchimento dos campos) |
| | 9 - Realiza o upload do arquivo e salva a solicitação com status "Aguardando avaliação" associada ao solicitante |
| | 10 - Exibe mensagem de sucesso: “Solicitação enviada. Você será avisado sobre o andamento da sua solicitação.” e atualiza a listagem de serviços |

## Fluxo Alternativo I – Formato de arquivo não suportado
| Ações do ator | Ações do sistema |
| :-----------------: | :-----------------: |
| 6.1 - Seleciona um arquivo com extensão não permitida | |
| | 6.2 - Exibe mensagem de erro: “Formatos aceitos: stl, obj, jpg, jpeg, png.” |

## Fluxo Alternativo II – Quantidade inválida
| Ações do ator | Ações do sistema |
| :-----------------: | :-----------------: |
| 4.1 - Informa uma quantidade menor ou igual a zero | |
| | 4.2 - Exibe mensagem de erro: “Informe uma quantidade válida.” |

## Fluxo Alternativo III – Campos em branco
| Ações do ator | Ações do sistema |
| :-----------------: | :-----------------: |
| 7.1 - Tenta enviar o formulário sem preencher tipo, quantidade, descrição ou sem anexar o arquivo | |
| | 7.2 - Exibe mensagem de erro indicando os campos obrigatórios a serem preenchidos |
