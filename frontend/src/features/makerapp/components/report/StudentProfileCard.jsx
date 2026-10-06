export function StudentProfileCard({ studentsProfile }) {
  const sp = studentsProfile || {
    public_schools_count: 0,
    private_schools_count: 0,
    public_visits_count: 0,
    private_visits_count: 0,
    public_visitors_count: 0,
    private_visitors_count: 0,
    total_school_visitors: 0,
    public_percentage: 0,
    private_percentage: 0,
  };

  const totalVisitors = sp.total_school_visitors || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Perfil dos Estudantes</h3>
            <p className="text-xs text-gray-500">Distribuição entre escolas públicas e privadas</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-forest-50 text-forest-700 border border-forest-200">
            {totalVisitors} {totalVisitors === 1 ? 'estudante' : 'estudantes'}
          </span>
        </div>

        {/* Ratio Bar */}
        <div className="space-y-1.5 mb-5">
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex">
            {totalVisitors > 0 ? (
              <>
                <div
                  className="bg-forest-600 transition-all duration-300"
                  style={{ width: `${sp.public_percentage}%` }}
                  title={`Escola Pública: ${sp.public_percentage}%`}
                />
                <div
                  className="bg-sky-500 transition-all duration-300"
                  style={{ width: `${sp.private_percentage}%` }}
                  title={`Escola Privada: ${sp.private_percentage}%`}
                />
              </>
            ) : (
              <div className="w-full bg-gray-200" />
            )}
          </div>
          <div className="flex justify-between text-[11px] text-gray-500 px-0.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-forest-600" />
              Pública: <strong>{sp.public_percentage}%</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              Privada: <strong>{sp.private_percentage}%</strong>
            </span>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Public School Card */}
          <div className="border border-forest-100 bg-forest-50/40 rounded-lg p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-forest-800">Escola Pública</span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-forest-100 text-forest-800">
                  {sp.public_percentage}%
                </span>
              </div>
              <p className="text-2xl font-bold text-forest-700 mt-1">
                {sp.public_visitors_count}
              </p>
              <p className="text-[11px] text-gray-600">estudantes visitantes</p>
            </div>

            <div className="mt-3 pt-2 border-t border-forest-100 text-[11px] text-gray-600 space-y-0.5">
              <p>Visitas: <strong className="text-forest-900">{sp.public_visits_count}</strong></p>
              <p>Escolas distintas: <strong className="text-forest-900">{sp.public_schools_count}</strong></p>
            </div>
          </div>

          {/* Private School Card */}
          <div className="border border-sky-100 bg-sky-50/40 rounded-lg p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-sky-800">Escola Privada</span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                  {sp.private_percentage}%
                </span>
              </div>
              <p className="text-2xl font-bold text-sky-700 mt-1">
                {sp.private_visitors_count}
              </p>
              <p className="text-[11px] text-gray-600">estudantes visitantes</p>
            </div>

            <div className="mt-3 pt-2 border-t border-sky-100 text-[11px] text-gray-600 space-y-0.5">
              <p>Visitas: <strong className="text-sky-900">{sp.private_visits_count}</strong></p>
              <p>Escolas distintas: <strong className="text-sky-900">{sp.private_schools_count}</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
