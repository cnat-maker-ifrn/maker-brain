import { useState } from 'react';

export function MonthlyVisitsBarChart({ data = [], selectedMonth, onSelectMonth }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const maxVal = Math.max(...data.map((d) => d.visits_count), 0);
  // Round up max for nice grid intervals
  const yMax = maxVal === 0 ? 5 : Math.ceil(maxVal * 1.25);
  const chartHeight = 180;
  const chartWidth = 540;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 25;
  const paddingBottom = 30;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const totalSchoolVisits = data.reduce((acc, curr) => acc + curr.visits_count, 0);
  const totalSchoolVisitors = data.reduce((acc, curr) => acc + curr.visitors_count, 0);

  // Y-axis grid levels (4 intervals)
  const gridLevels = [0, Math.round(yMax * 0.33), Math.round(yMax * 0.66), yMax];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Visitas de Escolas por Mês</h3>
          <p className="text-xs text-gray-500">Distribuição anual de visitas escolares atendidas</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-forest-50 text-forest-700 border border-forest-200">
            <span className="w-1.5 h-1.5 rounded-full bg-forest-600"></span>
            Total no ano: <strong>{totalSchoolVisits}</strong> ({totalSchoolVisitors} alunos)
          </span>
        </div>
      </div>

      {totalSchoolVisits === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
          <svg className="w-10 h-10 mb-2 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm font-medium">Nenhuma visita escolar registrada neste ano.</p>
        </div>
      ) : (
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto min-w-[480px] select-none"
          >
            {/* Grid lines */}
            {gridLevels.map((lvl, idx) => {
              const yPos = paddingTop + innerHeight - (lvl / yMax) * innerHeight;
              return (
                <g key={idx}>
                  <line
                    x1={paddingLeft}
                    y1={yPos}
                    x2={chartWidth - paddingRight}
                    y2={yPos}
                    stroke="#e2e8f0"
                    strokeDasharray={lvl === 0 ? 'none' : '3 3'}
                    strokeWidth={lvl === 0 ? '1.2' : '0.8'}
                  />
                  <text
                    x={paddingLeft - 8}
                    y={yPos + 3.5}
                    textAnchor="end"
                    fontSize="10"
                    fill="#94a3b8"
                    fontFamily="inherit"
                  >
                    {lvl}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {data.map((item, index) => {
              const colWidth = innerWidth / data.length;
              const barWidth = Math.min(26, colWidth * 0.65);
              const xPos = paddingLeft + index * colWidth + (colWidth - barWidth) / 2;
              const barHeight = yMax > 0 ? (item.visits_count / yMax) * innerHeight : 0;
              const yPos = paddingTop + innerHeight - barHeight;

              const isHovered = hoveredIndex === index;
              const isFilteredMonth = selectedMonth && Number(selectedMonth) === item.month;

              return (
                <g
                  key={item.month}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => onSelectMonth && onSelectMonth(item.month === Number(selectedMonth) ? '' : item.month)}
                >
                  {/* Invisible hit box for easier hover */}
                  <rect
                    x={paddingLeft + index * colWidth}
                    y={paddingTop}
                    width={colWidth}
                    height={innerHeight + paddingBottom}
                    fill="transparent"
                  />

                  {/* Active month background highlight */}
                  {isFilteredMonth && (
                    <rect
                      x={paddingLeft + index * colWidth + 2}
                      y={paddingTop}
                      width={colWidth - 4}
                      height={innerHeight}
                      fill="#ecfdf5"
                      rx="4"
                    />
                  )}

                  {/* The bar */}
                  <rect
                    x={xPos}
                    y={barHeight > 0 ? yPos : paddingTop + innerHeight - 2}
                    width={barWidth}
                    height={barHeight > 0 ? barHeight : 2}
                    rx={barHeight > 3 ? 4 : 1}
                    fill={
                      isFilteredMonth
                        ? '#059669' // Emerald 600
                        : isHovered
                        ? '#0b6d38' // Forest hover
                        : item.visits_count > 0
                        ? '#16a34a' // Green 600
                        : '#e2e8f0' // Empty slate 200
                    }
                    className="transition-colors duration-200"
                  />

                  {/* Value on top of bar */}
                  {item.visits_count > 0 && (
                    <text
                      x={xPos + barWidth / 2}
                      y={yPos - 5}
                      textAnchor="middle"
                      fontSize="9.5"
                      fontWeight="600"
                      fill={isFilteredMonth ? '#059669' : '#1e293b'}
                    >
                      {item.visits_count}
                    </text>
                  )}

                  {/* X-axis Month Label */}
                  <text
                    x={xPos + barWidth / 2}
                    y={paddingTop + innerHeight + 16}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight={isFilteredMonth || isHovered ? '700' : '500'}
                    fill={isFilteredMonth ? '#059669' : isHovered ? '#1e293b' : '#64748b'}
                  >
                    {item.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip display */}
          {hoveredIndex !== null && data[hoveredIndex] && (
            <div className="mt-2 text-center text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-md py-1.5 px-3">
              <span className="font-semibold text-gray-900">{data[hoveredIndex].full_name}:</span>{' '}
              {data[hoveredIndex].visits_count} {data[hoveredIndex].visits_count === 1 ? 'visita' : 'visitas'} escolares •{' '}
              {data[hoveredIndex].visitors_count} estudantes
            </div>
          )}
        </div>
      )}
    </div>
  );
}
