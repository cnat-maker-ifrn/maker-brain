export function PendingScholarshipStudentCard({ student, onAccept, onReject, isProcessing }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-200 bg-white rounded-lg p-4 shadow-sm hover:border-forest-200 transition-colors">
      <div className="space-y-1 min-w-0">
        <p className="text-forest-700 font-semibold text-base break-words">{student.name}</p>
        <p className="text-sm text-gray-600 break-all">{student.email}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 pt-1">
          <span>Matrícula: <span className="font-mono text-gray-700">{student.enrollment}</span></span>
          <span>CPF: <span className="text-gray-700">{student.cpf}</span></span>
        </div>
      </div>
      <div className="flex items-center gap-2 self-stretch sm:self-center shrink-0 border-t border-gray-100 pt-3 sm:border-t-0 sm:pt-0">
        <button
          onClick={() => onAccept(student.id)}
          disabled={isProcessing}
          className="flex-1 sm:flex-initial px-4 py-2 rounded-md bg-forest-600 text-white text-sm font-medium hover:bg-forest-500 disabled:opacity-50 transition-colors text-center"
        >
          Aprovar
        </button>
        <button
          onClick={() => onReject(student.cpf)}
          disabled={isProcessing}
          className="flex-1 sm:flex-initial px-4 py-2 rounded-md border border-danger-500 text-danger-600 hover:bg-danger-50 disabled:opacity-50 text-sm font-medium transition-colors text-center"
        >
          Rejeitar
        </button>
      </div>
    </div>
  );
}