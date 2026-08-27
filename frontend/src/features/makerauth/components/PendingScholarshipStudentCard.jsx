export function PendingScholarshipStudentCard({ student, onAccept, onReject, isProcessing }) {
  return (
    <div className="flex items-center justify-between border border-gray-200 bg-white rounded-lg p-4 shadow-sm">
      <div>
        <p className="text-forest-700 font-medium">{student.name}</p>
        <p className="text-sm text-gray-500">{student.email}</p>
        <p className="text-sm text-gray-500">Matrícula: {student.enrollment}</p>
        <p className="text-sm text-gray-500">CPF: {student.cpf}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onAccept(student.id)}
          disabled={isProcessing}
          className="px-3 py-1.5 rounded bg-forest-600 text-white font-medium hover:bg-forest-500 disabled:opacity-50"
        >
          Aprovar
        </button>
        <button
          onClick={() => onReject(student.cpf)}
          disabled={isProcessing}
          className="px-3 py-1.5 rounded border border-danger-500 text-danger-600 hover:bg-danger-50 disabled:opacity-50"
        >
          Rejeitar
        </button>
      </div>
    </div>
  );
}