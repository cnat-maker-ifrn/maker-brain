export function PendingScholarshipStudentCard({ student, onAccept, onReject, isProcessing }) {
  return (
    <div className="flex items-center justify-between border border-graphite-700 bg-graphite-800 rounded-lg p-4">
      <div>
        <p className="text-amber-400 font-medium">{student.name}</p>
        <p className="text-sm text-graphite-400">{student.email}</p>
        <p className="text-sm text-graphite-400">Matrícula: {student.enrollment}</p>
        <p className="text-sm text-graphite-400">CPF: {student.cpf}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onAccept(student.cpf)}
          disabled={isProcessing}
          className="px-3 py-1.5 rounded bg-amber-500 text-graphite-900 font-medium hover:bg-amber-400 disabled:opacity-50"
        >
          Aprovar
        </button>
        <button
          onClick={() => onReject(student.cpf)}
          disabled={isProcessing}
          className="px-3 py-1.5 rounded border border-red-500 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
        >
          Rejeitar
        </button>
      </div>
    </div>
  );
}