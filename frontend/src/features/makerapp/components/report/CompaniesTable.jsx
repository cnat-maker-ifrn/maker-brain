import { useState } from 'react';

export function CompaniesTable({ companiesProfile }) {
  const [searchTerm, setSearchTerm] = useState('');

  const companies = companiesProfile?.list || [];
  const totalCompanies = companiesProfile?.total_companies || 0;
  const incubatedCount = companiesProfile?.incubated_companies_count || 0;
  const nonIncubatedCount = companiesProfile?.non_incubated_companies_count || 0;

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.cnpj && c.cnpj.includes(searchTerm))
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Empresas Atendidas pelo Laboratório
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
            <span>
              Total: <strong>{totalCompanies}</strong> {totalCompanies === 1 ? 'empresa' : 'empresas'}
            </span>
            <span>•</span>
            <span className="text-forest-700 font-medium">
              {incubatedCount} incubadas no IFRN
            </span>
            <span>•</span>
            <span className="text-slate-600">
              {nonIncubatedCount} externas / não incubadas
            </span>
          </div>
        </div>

        {companies.length > 3 && (
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Buscar empresa por nome ou CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs rounded-lg border border-gray-200 pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-forest-500 focus:border-forest-500"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-2.5 top-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        )}
      </div>

      {companies.length === 0 ? (
        <div className="p-8 text-center text-gray-400 text-sm">
          Nenhuma empresa atendida no período selecionado.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Empresa</th>
                <th className="py-3 px-4">CNPJ</th>
                <th className="py-3 px-4 text-center">Incubada no IFRN?</th>
                <th className="py-3 px-4 text-center">Visitas</th>
                <th className="py-3 px-4 text-center">Visitantes</th>
                <th className="py-3 px-4">Datas das Visitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredCompanies.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {c.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-600">
                    {c.cnpj}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        c.is_incubated
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {c.is_incubated ? 'Sim (Incubada)' : 'Não (Externa)'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-gray-900">
                    {c.visits_count}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-forest-700">
                    {c.total_visitors}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {c.dates?.map((d, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 border border-gray-200"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
