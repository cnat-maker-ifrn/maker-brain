# CDU003. Gerenciar agendamentos de visitas

- **Ator principal**: Coordenadora / Bolsista
- **Resumo**: Os membros da equipe do laboratório consultam todas as visitas solicitadas, avaliam as visitas pendentes (aceitando ou rejeitando) e registram o encerramento daquelas que foram realizadas, incluindo foto, observações e número real de visitantes.
- **Pré-condição**: O usuário está autenticado no sistema e pertence ao grupo de gestão de visitas (Coordenadora, Gerente ou Bolsista).
- **Pós-condição**: O status da visita é atualizado no sistema (aceita, rejeitada ou fechada), liberando o horário em caso de recusa ou consolidando as evidências e métricas em caso de fechamento.

## Fluxo Principal – Aceitar agendamento de visita
| Ações do ator | Ações do sistema |
| :-----------------: | :-----------------: |
| 1 - Acessa a página de "Gerenciamento de Visitas" | |
| | 2 - Valida as permissões do usuário e exibe a lista com todas as visitas e seus respectivos status |
| 3 - Localiza uma visita com status "Aguardando avaliação" e clica no botão "Aceitar" | |
| | 4 - Valida a transição de estado da visita |
| | 5 - Atualiza o status da visita para "Em andamento" (aceita) |
| | 6 - Atualiza a listagem de visitas exibindo o novo status |

## Fluxo Alternativo I – Rejeitar agendamento de visita
| Ações do ator | Ações do sistema |
| :-----------------: | :-----------------: |
| 3.1 - Localiza uma visita com status "Aguardando avaliação" e clica no botão "Rejeitar" | |
| | 3.2 - Atualiza o status da visita para "Recusada" |
| | 3.3 - Libera o horário ocupado na grade de agendamentos para novas reservas |
| | 3.4 - Atualiza a listagem de visitas exibindo o novo status |

## Fluxo Alternativo II – Fechar visita realizada
| Ações do ator | Ações do sistema |
| :-----------------: | :-----------------: |
| 3.1 - Localiza uma visita com status "Em andamento" que já ocorreu e clica em fechar visita | |
| | 3.2 - Exibe o formulário de encerramento da visita |
| 3.3 - Confirma a realização da visita, informa o número real de visitantes, anexa a foto comprobatória e preenche as observações | |
| 3.4 - Clica no botão para confirmar o encerramento da visita | |
| | 3.5 - Valida os dados de fechamento, salva a foto e define a visita como fechada |
| | 3.6 - Atualiza o status da visita para "Fechada" e disponibiliza os dados para os relatórios do laboratório |

## Fluxo Alternativo III – Fechamento com campos obrigatórios ausentes
| Ações do ator | Ações do sistema |
| :-----------------: | :-----------------: |
| 3.4.1 - Tenta confirmar o encerramento sem anexar foto, sem preencher observações ou sem informar o número real de visitantes | |
| | 3.4.2 - Exibe mensagem de erro: “Preencha todos os campos obrigatórios para fechar a visita” |

## Fluxo Alternativo IV – Usuário sem permissão de acesso
| Ações do ator | Ações do sistema |
| :-----------------: | :-----------------: |
| 1.1 - Usuário sem perfil de gestão tenta acessar a página de gerenciamento de visitas | |
| | 1.2 - Nega o acesso e redireciona o usuário para a tela inicial |
