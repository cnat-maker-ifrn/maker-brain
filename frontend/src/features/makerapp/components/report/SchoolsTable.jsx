import { useState } from 'react';

export function SchoolsTable({ schools = [], totalSchools = 0 }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSchools = schools.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.city && s.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Escolas Atendidas pelo Laboratório
          </h3>
          <p className="text-xs text-gray-500">
            {totalSchools} {totalSchools === 1 ? 'escola cadastrada e atendida' : 'escolas cadastradas e atendidas'} no período
          </p>
        </div>

        {schools.length > 3 && (
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Buscar escola por nome ou cidade..."
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

      {schools.length === 0 ? (
        <div className="p-8 text-center text-gray-400 text-sm">
          Nenhuma escola atendida no período selecionado.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Escola</th>
                <th className="py-3 px-4">Rede</th>
                <th className="py-3 px-4">Localização</th>
                <th className="py-3 px-4 text-center">Visitas</th>
                <th className="py-3 px-4 text-center">Estudantes</th>
                <th className="py-3 px-4">Datas das Visitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredSchools.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {s.name}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        s.school_type === 'public'
                          ? 'bg-forest-100 text-forest-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {s.school_type_display}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {s.city} {s.state ? `- ${s.state}` : ''}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-gray-900">
                    {s.visits_count}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-forest-700">
                    {s.total_visitors}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {s.dates?.map((d, idx) => (
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
