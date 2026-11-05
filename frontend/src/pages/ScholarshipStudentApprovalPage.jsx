import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  usePendingScholarshipStudents,
  useScholarshipStudents,
  useDemotedScholarshipStudents,
  useScholarshipStudentActions,
  PendingScholarshipStudentCard,
  ActiveScholarshipStudentCard,
  DemotedScholarshipStudentCard,
} from '@/features/makerauth';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

export default function ScholarshipStudentsApprovalPage() {
  const location = useLocation();
  const initialTab = location.pathname.includes('/pending') ? 'pending' : 'active';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionSuccess, setActionSuccess] = useState(null);
  const [lastDemotedStudent, setLastDemotedStudent] = useState(null);

  const { user } = useAuth();
  const isOwner = user?.groups?.includes('Owners');

  const {
    students: pendingStudents,
    isLoading: pendingLoading,
    error: pendingError,
    refetch: refetchPending,
  } = usePendingScholarshipStudents();

  const {
    students: activeStudents,
    isLoading: activeLoading,
    error: activeError,
    refetch: refetchActive,
  } = useScholarshipStudents();

  const {
    students: demotedStudents,
    isLoading: demotedLoading,
    error: demotedError,
    refetch: refetchDemoted,
  } = useDemotedScholarshipStudents();

  const handleRefetchAll = () => {
    refetchPending();
    refetchActive();
    refetchDemoted();
  };

  const {
    accept,
    reject,
    promote,
    removeManager,
    demoteToRequester,
    repromote,
    processingId,
    error: actionError,
    setError: setActionError,
  } = useScholarshipStudentActions(handleRefetchAll);

  const handleAccept = async (id) => {
    setActionSuccess(null);
    setLastDemotedStudent(null);
    try {
      await accept(id);
      setActionSuccess('Bolsista aprovado com sucesso!');
    } catch {
      // Error handled in hook
    }
  };

  const handleReject = async (id) => {
    setActionSuccess(null);
    setLastDemotedStudent(null);
    try {
      await reject(id);
      setActionSuccess('Solicitação de bolsista rejeitada com sucesso!');
    } catch {
      // Error handled in hook
    }
  };

  const handlePromote = async (id) => {
    setActionSuccess(null);
    setLastDemotedStudent(null);
    try {
      await promote(id);
      setActionSuccess('Bolsista promovido ao grupo de gerentes com sucesso!');
    } catch {
      // Error handled in hook
    }
  };

  const handleRemoveManager = async (id) => {
    setActionSuccess(null);
    setLastDemotedStudent(null);
    try {
      await removeManager(id);
      setActionSuccess('Usuário removido do grupo de gerentes com sucesso!');
    } catch {
      // Error handled in hook
    }
  };

  const handleDemoteToRequester = async (studentOrId) => {
    const student =
      typeof studentOrId === 'object'
        ? studentOrId
        : activeStudents.find((s) => s.id === studentOrId);
    const studentId = student ? student.id : studentOrId;

    setActionSuccess(null);
    try {
      await demoteToRequester(studentId);
      setLastDemotedStudent(student || { id: studentId, name: 'Usuário' });
      setActionSuccess(
        student?.name
          ? `Bolsista "${student.name}" removido do grupo de bolsistas e mantido apenas como solicitante.`
          : 'Usuário removido do grupo de bolsistas e mantido apenas como solicitante.'
      );
    } catch {
      // Error handled in hook
    }
  };

  const handleRepromote = async (id) => {
    setActionSuccess(null);
    try {
      await repromote(id);
      setLastDemotedStudent(null);
      setActionSuccess('Usuário repromovido para bolsista com sucesso!');
    } catch {
      // Error handled in hook
    }
  };

  const filteredActiveStudents = useMemo(() => {
    if (!searchTerm.trim()) return activeStudents;
    const term = searchTerm.toLowerCase();
    return activeStudents.filter(
      (s) =>
        s.name?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term) ||
        s.enrollment?.toLowerCase().includes(term) ||
        s.cpf?.includes(term)
    );
  }, [activeStudents, searchTerm]);

  const filteredDemotedStudents = useMemo(() => {
    if (!searchTerm.trim()) return demotedStudents;
    const term = searchTerm.toLowerCase();
    return demotedStudents.filter(
      (s) =>
        s.name?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term) ||
        s.enrollment?.toLowerCase().includes(term) ||
        s.cpf?.includes(term)
    );
  }, [demotedStudents, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-forest-600">
            Gestão de Bolsistas
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Gerencie as solicitações pendentes, os bolsistas ativos e despromovidos do laboratório.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="rounded-lg border border-forest-200 bg-forest-50 p-4 text-sm font-medium text-forest-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-forest-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{actionSuccess}</span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            {lastDemotedStudent && isOwner && (
              <button
                type="button"
                onClick={() => handleRepromote(lastDemotedStudent.id)}
                disabled={processingId === lastDemotedStudent.id}
                className="px-3 py-1 rounded bg-forest-600 text-white hover:bg-forest-700 disabled:opacity-50 text-xs font-semibold shadow-2xs transition-colors shrink-0"
              >
                {processingId === lastDemotedStudent.id ? 'Repromovendo...' : 'Repromover para bolsista'}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setActionSuccess(null);
                setLastDemotedStudent(null);
              }}
              className="text-forest-600 hover:text-forest-800 p-1 text-sm font-bold"
              aria-label="Fechar notificação"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {actionError && (
        <div className="rounded-lg border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700 flex items-center justify-between">
          <span>{actionError.detail || actionError.non_field_errors || 'Ocorreu um erro ao executar a ação.'}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-danger-600 hover:text-danger-800 p-1 text-sm font-bold"
            aria-label="Fechar erro"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-medium border-b-2 transition-colors shrink-0 ${
            activeTab === 'active'
              ? 'border-forest-600 text-forest-700 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <span>Bolsistas Ativos</span>
          {!activeLoading && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                activeTab === 'active'
                  ? 'bg-forest-100 text-forest-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {activeStudents.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('demoted')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-medium border-b-2 transition-colors shrink-0 ${
            activeTab === 'demoted'
              ? 'border-forest-600 text-forest-700 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <span>Despromovidos</span>
          {!demotedLoading && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                activeTab === 'demoted'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {demotedStudents.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-medium border-b-2 transition-colors shrink-0 ${
            activeTab === 'pending'
              ? 'border-forest-600 text-forest-700 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <span>Solicitações Pendentes</span>
          {!pendingLoading && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                pendingStudents.length > 0
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {pendingStudents.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab: Solicitações Pendentes */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingLoading && <Spinner />}
          {pendingError && <p className="text-danger-600">{pendingError.detail || pendingError}</p>}

          {!pendingLoading && pendingStudents.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
              Nenhuma solicitação de bolsista pendente no momento.
            </div>
          )}

          <div className="flex flex-col gap-3">
            {pendingStudents.map((student) => (
              <PendingScholarshipStudentCard
                key={student.id}
                student={student}
                onAccept={handleAccept}
                onReject={handleReject}
                isProcessing={processingId === student.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tab: Bolsistas Ativos */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar por nome, email, CPF ou matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3.5 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {!isOwner && (
              <p className="text-xs text-gray-500 self-center">
                * Apenas usuários no grupo <strong className="font-semibold text-gray-700">Owners</strong> podem promover gerentes ou remover bolsistas.
              </p>
            )}
          </div>

          {activeLoading && <Spinner />}
          {activeError && <p className="text-danger-600">{activeError.detail || activeError}</p>}

          {!activeLoading && filteredActiveStudents.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
              {activeStudents.length === 0
                ? 'Nenhum bolsista ativo cadastrado no laboratório.'
                : 'Nenhum bolsista encontrado com os filtros aplicados.'}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {filteredActiveStudents.map((student) => (
              <ActiveScholarshipStudentCard
                key={student.id}
                student={student}
                isOwner={isOwner}
                onPromote={handlePromote}
                onRemoveManager={handleRemoveManager}
                onDemoteToRequester={handleDemoteToRequester}
                isProcessing={processingId === student.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tab: Despromovidos */}
      {activeTab === 'demoted' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar por nome, email, CPF ou matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3.5 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {!isOwner && (
              <p className="text-xs text-gray-500 self-center">
                * Apenas usuários no grupo <strong className="font-semibold text-gray-700">Owners</strong> podem repromover bolsistas.
              </p>
            )}
          </div>

          {demotedLoading && <Spinner />}
          {demotedError && <p className="text-danger-600">{demotedError.detail || demotedError}</p>}

          {!demotedLoading && filteredDemotedStudents.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
              {demotedStudents.length === 0
                ? 'Nenhum bolsista despromovido no momento.'
                : 'Nenhum bolsista despromovido encontrado com os filtros aplicados.'}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {filteredDemotedStudents.map((student) => (
              <DemotedScholarshipStudentCard
                key={student.id}
                student={student}
                isOwner={isOwner}
                onRepromote={handleRepromote}
                isProcessing={processingId === student.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
