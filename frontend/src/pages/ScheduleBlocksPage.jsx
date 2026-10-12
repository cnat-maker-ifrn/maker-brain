import { useState, useMemo } from 'react';
import { useScheduleBlocks } from '@/features/makerapp/hooks/useScheduleBlocks';
import { ScheduleBlockCard } from '@/features/makerapp/components/ScheduleBlockCard';
import { CreateScheduleBlockModal } from '@/features/makerapp/components/CreateScheduleBlockModal';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';

export default function ScheduleBlocksPage() {
  const {
    blocks,
    isLoading,
    isSubmitting,
    error,
    processingId,
    createBlocks,
    deleteBlock,
    bulkDeleteBlocks,
  } = useScheduleBlocks();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('upcoming'); // 'all' | 'upcoming' | 'past'

  // Filtered blocks
  const filteredBlocks = useMemo(() => {
    const now = new Date();
    return blocks.filter((b) => {
      const blockEndDate = new Date(b.end_datetime);

      if (filterTab === 'upcoming' && blockEndDate < now) return false;
      if (filterTab === 'past' && blockEndDate >= now) return false;

      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const reasonMatch = b.reason?.toLowerCase().includes(term);
      const dateMatch = new Date(b.start_datetime).toLocaleDateString('pt-BR').includes(term);
      const authorMatch = b.created_by_name?.toLowerCase().includes(term);

      return reasonMatch || dateMatch || authorMatch;
    });
  }, [blocks, filterTab, searchTerm]);


  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredBlocks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredBlocks.map((b) => b.id));
    }
  };

  const handleDeleteSingle = async (id) => {
    if (window.confirm('Tem certeza de que deseja remover este bloqueio e liberar o horário para agendamento?')) {
      await deleteBlock(id);
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (
      window.confirm(
        `Tem certeza de que deseja remover ${selectedIds.length} bloqueio(s) selecionado(s) e liberar os horários?`
      )
    ) {
      const success = await bulkDeleteBlocks(selectedIds);
      if (success) {
        setSelectedIds([]);
      }
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Bloqueio de Agenda e Horários
            </h1>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-forest-100 text-forest-800">
              Apenas Owners
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Torne dias e horários indisponíveis no agendamento para feriados, manutenções e dias que o laboratório ficará fechado.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto shadow-sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Bloquear datas/horários
          </Button>
        </div>
      </div>

      {/* Filter and Bulk Action Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
        {/* Tabs */}
        <div className="flex rounded-lg bg-gray-100 p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setFilterTab('upcoming')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md transition-colors ${
              filterTab === 'upcoming'
                ? 'bg-white text-gray-900 shadow-xs font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Próximos / Ativos
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md transition-colors ${
              filterTab === 'all'
                ? 'bg-white text-gray-900 shadow-xs font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Todos ({blocks.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('past')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md transition-colors ${
              filterTab === 'past'
                ? 'bg-white text-gray-900 shadow-xs font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Passados
          </button>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por motivo, data ou responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500/30"
            />
            <svg
              className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Bulk Action Button */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-danger-700 bg-danger-50 border border-danger-200 hover:bg-danger-100 rounded-lg transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Excluir selecionados ({selectedIds.length})
            </button>
          </div>
        )}
      </div>

      {/* Select All Checkbox bar if items exist */}
      {filteredBlocks.length > 0 && (
        <div className="flex items-center justify-between px-2 text-xs text-gray-500">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={selectedIds.length === filteredBlocks.length && filteredBlocks.length > 0}
              onChange={handleSelectAll}
              className="h-4 w-4 rounded border-gray-300 text-forest-600 focus:ring-forest-500"
            />
            <span>
              {selectedIds.length === 0
                ? 'Selecionar todos os itens da lista'
                : `${selectedIds.length} de ${filteredBlocks.length} selecionado(s)`}
            </span>
          </label>
          <span>Exibindo {filteredBlocks.length} bloqueio(s)</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading && <Spinner />}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-danger-50 border border-danger-200 rounded-xl text-danger-700 text-sm">
          {error.detail || error.non_field_errors || 'Erro ao carregar os bloqueios de agenda.'}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredBlocks.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 sm:p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-forest-50 text-forest-600 mb-3">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900">Nenhum bloqueio cadastrado</h3>
          <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
            {searchTerm
              ? 'Nenhum resultado encontrado para a busca.'
              : 'O laboratório está com todos os dias e horários padrão livres para agendamentos de visitas.'}
          </p>
          {!searchTerm && (
            <div className="mt-4">
              <Button onClick={() => setIsModalOpen(true)}>
                + Bloquear datas/horários
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Cards List */}
      <div className="flex flex-col gap-3">
        {filteredBlocks.map((block) => (
          <ScheduleBlockCard
            key={block.id}
            block={block}
            isSelected={selectedIds.includes(block.id)}
            onToggleSelect={toggleSelectOne}
            onDelete={handleDeleteSingle}
            isDeleting={processingId === block.id}
          />
        ))}
      </div>

      {/* Modal */}
      <CreateScheduleBlockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={createBlocks}
        isSubmitting={isSubmitting}
        error={error}
      />
    </div>
  );
}
