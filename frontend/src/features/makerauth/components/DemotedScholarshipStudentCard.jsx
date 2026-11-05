import { useState } from 'react';

export function DemotedScholarshipStudentCard({
  student,
  isOwner,
  onRepromote,
  isProcessing,
}) {
  const [confirmRepromote, setConfirmRepromote] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-200 bg-white rounded-lg p-4 shadow-sm hover:border-forest-200 transition-colors">
      <div className="space-y-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-gray-900 font-semibold text-base break-words">{student.name}</p>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
            Despromovido
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
            Solicitante
          </span>
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
          {!confirmRepromote ? (
            <button
              type="button"
              onClick={() => setConfirmRepromote(true)}
              disabled={isProcessing}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-md bg-forest-600 text-white hover:bg-forest-500 disabled:opacity-50 text-xs sm:text-sm font-medium transition-colors text-center"
              title="Repromover usuário ao grupo de bolsistas"
            >
              Repromover a Bolsista
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-forest-50 p-2 rounded-lg border border-forest-200">
              <span className="text-xs text-forest-800 font-medium">
                Repromover para Bolsista?
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={async () => {
                    await onRepromote(student.id);
                    setConfirmRepromote(false);
                  }}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded bg-forest-600 text-white hover:bg-forest-700 disabled:opacity-50 text-xs font-semibold"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmRepromote(false)}
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
