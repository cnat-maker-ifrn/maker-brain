import {
  usePendingScholarshipStudents,
  useScholarshipStudentActions,
  PendingScholarshipStudentCard,
} from '@/features/makerauth';
import { PageContainer } from '@/components/layout/PageContainer';
import { Spinner } from '@/components/ui/Spinner';

export default function ScholarshipStudentsApprovalPage() {
  const { students, isLoading, error, refetch } = usePendingScholarshipStudents();
  const { accept, reject, processingId } = useScholarshipStudentActions(refetch);

  return (
    <PageContainer>
      <h1 className="text-2xl font-semibold text-amber-400 mb-6">
        Solicitações de Cadastro — Bolsistas
      </h1>

      {isLoading && <Spinner />}
      {error && <p className="text-red-400">{error}</p>}

      {!isLoading && students.length === 0 && (
        <p className="text-graphite-400">Nenhuma solicitação pendente.</p>
      )}

      <div className="flex flex-col gap-3">
        {students.map((student) => (
          <PendingScholarshipStudentCard
            key={student.id}
            student={student}
            onAccept={accept}
            onReject={reject}
            isProcessing={processingId === student.id}
          />
        ))}
      </div>
    </PageContainer>
  );
}