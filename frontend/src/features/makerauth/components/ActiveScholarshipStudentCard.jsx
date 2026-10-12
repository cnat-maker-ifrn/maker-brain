import { useState } from 'react';

export function ActiveScholarshipStudentCard({
  student,
  isOwner,
  onPromote,
  onRemoveManager,
  onDemoteToRequester,
  isProcessing,
}) {
  const [confirmDemote, setConfirmDemote] = useState(false);
  const isManager = student.groups?.includes('Managers');

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-200 bg-white rounded-lg p-4 shadow-sm hover:border-forest-200 transition-colors">
      <div className="space-y-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-forest-700 font-semibold text-base break-words">{student.name}</p>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-forest-100 text-forest-800">
            Bolsista
          </span>
          {isManager && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 font-semibold">
              Gerente
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 break-all">{student.email}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 pt-1">
          {student.enrollment && (
            <span>Matrícula: <span className="font-mono text-gray-700">{student.enrollment}</span></span>
          )}
          {student.cpf && (
            <span>CPF: <span className="text-gray-700">{student.cpf}</span></span>
          )}
        </div>
      </div>

      {isOwner && (
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-center shrink-0 border-t border-gray-100 pt-3 sm:border-t-0 sm:pt-0">
          {!confirmDemote ? (
            <>
              {isManager ? (
                <button
                  type="button"
                  onClick={() => onRemoveManager(student.id)}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-md border border-amber-500 text-amber-700 hover:bg-amber-50 disabled:opacity-50 text-xs sm:text-sm font-medium transition-colors text-center"
                  title="Remover este usuário do grupo de gerentes"
                >
                  Remover de Gerente
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onPromote(student.id)}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-md bg-forest-600 text-white hover:bg-forest-500 disabled:opacity-50 text-xs sm:text-sm font-medium transition-colors text-center"
                  title="Promover bolsista ao grupo de gerentes"
                >
                  Promover a Gerente
                </button>
              )}

              <button
                type="button"
                onClick={() => setConfirmDemote(true)}
                disabled={isProcessing}
                className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-md border border-danger-500 text-danger-600 hover:bg-danger-50 disabled:opacity-50 text-xs sm:text-sm font-medium transition-colors text-center"
                title="Tirar do grupo de bolsistas e deixar apenas como solicitante"
              >
                Tirar de Bolsista
              </button>
            </>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-danger-50 p-2 rounded-lg border border-danger-200">
              <span className="text-xs text-danger-800 font-medium">
                Deixar apenas como solicitante?
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={async () => {
                    await onDemoteToRequester(student.id);
                    setConfirmDemote(false);
                  }}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded bg-danger-600 text-white hover:bg-danger-700 disabled:opacity-50 text-xs font-semibold"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDemote(false)}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
