# Requisito original
O sistema deve permitir o gerenciamento dos agendamentos de visitas

# História de usuário
Como coordenadora,
quero aprovar, recusar, remarcar e cancelar agendamentos de visitas,
para controlar o fluxo de visitantes e manter a organização das atividades do laboratório.

# Critérios de aceitação
1. Dado que existe um agendamento com status "Pendente",
quando eu aprovo o agendamento,
então o sistema altera o status para "Aprovado" e registra a data da alteração.

2. Dado que existe um agendamento com status "Pendente",
quando eu recuso o agendamento informando o motivo,
então o sistema altera o status para "Recusado" e disponibiliza o motivo para o solicitante.

3. Dado que existe um agendamento aprovado,
quando eu altero a data ou o horário para uma opção disponível,
então o sistema atualiza o agendamento e mantém o histórico da alteração.

4. Dado que existe um agendamento ainda não realizado,
quando eu o cancelo e confirmo a ação,
então o sistema altera o status para "Cancelado" e libera o horário para novos agendamentos.

5. Dado que estou autenticado como solicitante,
quando tento aprovar, recusar ou cancelar o agendamento de outra pessoa,
então o sistema nega a ação, pois essas operações são restritas à coordenação.
