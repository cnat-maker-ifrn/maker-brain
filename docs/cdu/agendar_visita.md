# CDU001. Agendar visita

- **Ator principal**: Solicitante
- **Resumo**: O solicitante agenda uma visita ao laboratório CNAT Maker informando o tipo de visita, número previsto de visitantes, vínculo/origem, data, horário e descrição opcional.
- **Pré-condição**: O solicitante está autenticado no sistema.
- **Pós-condição**: O agendamento da visita é registrado com status "Aguardando avaliação", o horário é reservado na grade e a visita fica disponível para consulta do solicitante e avaliação da equipe do laboratório.

## Fluxo Principal – Agendamento de visita com sucesso
| Ações do ator | Ações do sistema |
| :-----------------: | :-----------------: |
| 1 - Na tela inicial, clica no botão "Solicitar visita" | |
| | 2 - Exibe o formulário de agendamento de visita contendo tipo de visita, número de visitantes, origem, seletor de data/horário e descrição |
| 3 - Seleciona o tipo de visita (Rápida, Infantil ou Técnica) | |
| | 4 - Atualiza a capacidade máxima de visitantes e a duração da visita de acordo com o tipo escolhido |
| 5 - Informa o número previsto de visitantes | |
| 6 - Seleciona a origem da solicitação (Externo) | |
| 7 - Seleciona a data e o horário desejados no seletor de horários | |
| 8 - (Opcional) Informa a descrição da visita | |
| 9 - Clica no botão "Solicitar visita" | |
| | 10 - Valida as informações informadas (capacidade máxima, antecedência mínima de 2 dias e ausência de conflitos de horário) |
| | 11 - Registra o agendamento da visita com status "Aguardando avaliação" associado ao usuário logado |
| | 12 - Exibe mensagem de sucesso: “Visita solicitada - Aguardando aprovação” e atualiza a lista de visitas |

## Fluxo Alternativo I – Origem Escola
| Ações do ator | Ações do sistema |
| :-----------------: | :-----------------: |
| 6.1 - Seleciona a origem "Escola" | |
| | 6.2 - Exibe campo de seleção com a lista de escolas cadastradas |
| 6.3 - Seleciona a escola desejada e retorna ao passo 7 do Fluxo Principal | |

## Fluxo Alternativo II – Origem Empresa
| Ações do ator | Ações do sistema |
| :-----------------: | :-----------------: |
| 6.1 - Seleciona a origem "Empresa" | |
| | 6.2 - Exibe campo de seleção com a lista de empresas cadastradas |
| 6.3 - Seleciona a empresa desejada e retorna ao passo 7 do Fluxo Principal | |

## Fluxo Alternativo III – Origem Departamento CNAT
| Ações do ator | Ações do sistema |
| :-----------------: | :-----------------: |
| 6.1 - Seleciona a origem "CNAT" | |
| | 6.2 - Exibe campo de seleção com os departamentos do CNAT (DIATINF, DIAREN, DIACON, DIACIN, DIAC) |
| 6.3 - Seleciona o departamento desejado e retorna ao passo 7 do Fluxo Principal | |

## Fluxo Alternativo IV – Antecedência mínima não respeitada
| Ações do ator | Ações do sistema |
| :-----------------: | :-----------------: |
| 9.1 - Tenta enviar o agendamento com data com menos de 2 dias de antecedência | |
| | 9.2 - Exibe mensagem de erro: “As visitas devem ser agendadas com pelo menos 2 dias de antecedência” |

## Fluxo Alternativo V – Capacidade máxima de visitantes excedida
| Ações do ator | Ações do sistema |
| :-----------------: | :-----------------: |
| 5.1 - Informa número de visitantes superior ao limite suportado pelo tipo de visita | |
| | 5.2 - Exibe mensagem de erro: “Máximo de {X} visitantes para esse tipo de visita” |

## Fluxo Alternativo VI – Conflito de horário
| Ações do ator | Ações do sistema |
| :-----------------: | :-----------------: |
| 9.1 - Tenta submeter agendamento para horário que coincide com outra visita já agendada | |
| | 9.2 - Exibe mensagem de erro: “Já existe uma visita agendada que coincide com este horário” |

## Fluxo Alternativo VII – Campos obrigatórios em branco
| Ações do ator | Ações do sistema |
| :-----------------: | :-----------------: |
| 9.1 - Tenta enviar o formulário sem preencher campos obrigatórios (data/horário, número de visitantes ou vínculo institucional) | |
| | 9.2 - Exibe mensagem indicando os campos obrigatórios a serem preenchidos |