import { useReport } from '@/features/makerapp/hooks/useReport';
import { MonthlyVisitsBarChart } from '@/features/makerapp/components/report/MonthlyVisitsBarChart';
import { DirectoratesPieChart } from '@/features/makerapp/components/report/DirectoratesPieChart';
import { StudentProfileCard } from '@/features/makerapp/components/report/StudentProfileCard';
import { SchoolsTable } from '@/features/makerapp/components/report/SchoolsTable';
import { CompaniesTable } from '@/features/makerapp/components/report/CompaniesTable';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';

const MONTH_OPTIONS = [
  { value: '', label: 'Ano Completo' },
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

export default function ReportsPage() {
  const currentYear = new Date().getFullYear();
  const {
    reportData,
    isLoading,
    isDownloadingPdf,
    error,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    downloadPdf,
    refetch,
  } = useReport(currentYear, '');

  const availableYears = reportData?.available_years || [currentYear, currentYear - 1, currentYear - 2];
  const summary = reportData?.summary || {
    total_visitors: 0,
    total_visits: 0,
    total_schools: 0,
    total_companies: 0,
    total_directorates: 0,
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Relatórios e Indicadores
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Métricas de visitantes, perfil escolar, empresas incubadas e diretorias atendidas.
          </p>
        </div>

        {/* Filter Bar and Action Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Year selector */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
            <label htmlFor="year-select" className="text-xs font-semibold text-gray-500">
              Ano:
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-xs sm:text-sm font-medium text-gray-900 bg-transparent focus:outline-none cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Month selector */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
            <label htmlFor="month-select" className="text-xs font-semibold text-gray-500">
              Mês:
            </label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs sm:text-sm font-medium text-gray-900 bg-transparent focus:outline-none cursor-pointer"
            >
              {MONTH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={refetch}
            disabled={isLoading}
            title="Atualizar dados"
            aria-label="Atualizar dados"
            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-forest-600 hover:bg-forest-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg
              className={`w-4 h-4 ${isLoading ? 'animate-spin text-forest-600' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          {/* PDF Generation Button */}
          <Button
            onClick={downloadPdf}
            isLoading={isDownloadingPdf}
            disabled={isLoading || !reportData}
            className="shadow-xs text-xs sm:text-sm"
          >
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Gerar Relatório em PDF
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="py-16 flex flex-col items-center justify-center">
          <Spinner />
          <p className="text-xs text-gray-500 mt-2">Carregando dados do relatório...</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-danger-50 border border-danger-200 p-4 text-sm text-danger-700">
          {error.detail || error.non_field_errors || 'Erro ao carregar dados do relatório.'}
        </div>
      )}

      {!isLoading && reportData && (
        <>
          {/* Active Period Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-forest-50/70 border border-forest-200 rounded-xl px-4 py-2.5 text-xs text-forest-800">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-forest-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                Exibindo dados para: <strong>{reportData.period.label}</strong>
              </span>
            </div>
            <span className="text-gray-500 text-[11px]">
              Atualizado em {reportData.generated_at}
            </span>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Visitors */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-forest-300 transition-all col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Visitantes</span>
                <span className="p-1.5 rounded-lg bg-forest-50 text-forest-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-forest-700">
                {summary.total_visitors}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">Total de pessoas atendidas</p>
            </div>

            {/* Visits */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-forest-300 transition-all">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Visitas</span>
                <span className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {summary.total_visits}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">Visitas realizadas</p>
            </div>

            {/* Schools */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-forest-300 transition-all">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Escolas</span>
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {summary.total_schools}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">Escolas distintas atendidas</p>
            </div>

            {/* Companies */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-forest-300 transition-all">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Empresas</span>
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {summary.total_companies}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                {reportData.companies.incubated_companies_count} incubadas IFRN
              </p>
            </div>

            {/* Directorates */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-forest-300 transition-all">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Diretorias</span>
                <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {summary.total_directorates}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">Diretorias do CNAT atendidas</p>
            </div>
          </div>

          {/* Main Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Bar Chart: School Visits per Month (7 cols) */}
            <div className="lg:col-span-7">
              <MonthlyVisitsBarChart
                data={reportData.monthly_school_visits}
                selectedMonth={selectedMonth}
                onSelectMonth={(m) => setSelectedMonth(m ? String(m) : '')}
              />
            </div>

            {/* Pie Chart: Directorates Attended (5 cols) */}
            <div className="lg:col-span-5">
              <DirectoratesPieChart directoratesData={reportData.directorates} />
            </div>
          </div>

          {/* Secondary Row: Student Profile & Incubator Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7">
              <StudentProfileCard studentsProfile={reportData.students_profile} />
            </div>

            {/* Incubator Highlights Card */}
            <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Incubadora de Empresas do IFRN
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Apoio do laboratório às empresas residentes e incubadas
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-lg">
                    <span className="text-xs font-semibold text-emerald-800">Incubadas no IFRN</span>
                    <p className="text-2xl font-bold text-emerald-700 mt-1">
                      {reportData.companies.incubated_companies_count}
                    </p>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      {reportData.companies.incubated_visits_count} visitas realizadas
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-xs font-semibold text-slate-800">Não Incubadas / Externas</span>
                    <p className="text-2xl font-bold text-slate-700 mt-1">
                      {reportData.companies.non_incubated_companies_count}
                    </p>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      {reportData.companies.non_incubated_visits_count} visitas realizadas
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                O laboratório CNAT Maker oferece infraestrutura e prototipagem rápida para as empresas vinculadas à incubadora do IFRN e ao ecossistema local de inovação.
              </div>
            </div>
          </div>

          {/* Tables Row: Schools and Companies */}
          <div className="space-y-6">
            <SchoolsTable
              schools={reportData.schools.list}
              totalSchools={reportData.schools.total}
            />

            <CompaniesTable companiesProfile={reportData.companies} />
          </div>
        </>
      )}
    </div>
  );
}
