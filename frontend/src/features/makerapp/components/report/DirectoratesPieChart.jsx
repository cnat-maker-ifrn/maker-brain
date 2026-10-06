import { useState } from 'react';

const DEPARTMENT_COLORS = {
  diatinf: '#0b6d38', // Forest Green
  diaren: '#0284c7',  // Sky Blue
  diacon: '#d97706',  // Amber
  diacin: '#7c3aed',  // Violet
  diac: '#db2777',    // Pink
};

const FALLBACK_COLORS = [
  '#059669', '#2563eb', '#9333ea', '#ea580c', '#0891b2', '#4b5563'
];

export function DirectoratesPieChart({ directoratesData }) {
  const [hoveredDept, setHoveredDept] = useState(null);

  const breakdown = directoratesData?.breakdown || [];
  const totalAttended = directoratesData?.total_attended || 0;
  const totalVisits = breakdown.reduce((acc, curr) => acc + curr.visits_count, 0);

  // SVG dimensions
  const size = 200;
  const center = size / 2;
  const radius = 78;
  const innerRadius = 48; // Donut hole

  // Pre-calculate SVG arcs
  let accumulatedAngle = 0;
  const slices = breakdown.map((item, idx) => {
    const fraction = totalVisits > 0 ? item.visits_count / totalVisits : 0;
    const angle = fraction * 360;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle += angle;

    const color = DEPARTMENT_COLORS[item.department] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length];

    // Helper for polar to cartesian
    const toRadians = (deg) => ((deg - 90) * Math.PI) / 180.0;
    const x1 = center + radius * Math.cos(toRadians(startAngle));
    const y1 = center + radius * Math.sin(toRadians(startAngle));
    const x2 = center + radius * Math.cos(toRadians(endAngle));
    const y2 = center + radius * Math.sin(toRadians(endAngle));

    const x3 = center + innerRadius * Math.cos(toRadians(endAngle));
    const y3 = center + innerRadius * Math.sin(toRadians(endAngle));
    const x4 = center + innerRadius * Math.cos(toRadians(startAngle));
    const y4 = center + innerRadius * Math.sin(toRadians(startAngle));

    const largeArc = angle > 180 ? 1 : 0;

    const pathData =
      angle >= 359.9
        ? `M ${center} ${center - radius} A ${radius} ${radius} 0 1 1 ${center} ${center + radius} A ${radius} ${radius} 0 1 1 ${center} ${center - radius} M ${center} ${center - innerRadius} A ${innerRadius} ${innerRadius} 0 1 0 ${center} ${center + innerRadius} A ${innerRadius} ${innerRadius} 0 1 0 ${center} ${center - innerRadius} Z`
        : `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;

    return {
      ...item,
      color,
      pathData,
      startAngle,
      endAngle,
    };
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between h-full">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">Diretorias Atendidas</h3>
        <p className="text-xs text-gray-500">Participação das diretorias acadêmicas do IFRN</p>
      </div>

      {totalVisits === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
          <svg className="w-10 h-10 mb-2 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          <p className="text-sm font-medium">Nenhuma visita de diretoria registrada no período.</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* SVG Donut */}
          <div className="relative shrink-0">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
              {slices.map((slice) => {
                const isHovered = hoveredDept === slice.department;
                return (
                  <path
                    key={slice.department}
                    d={slice.pathData}
                    fill={slice.color}
                    className="cursor-pointer transition-all duration-200"
                    opacity={hoveredDept === null || isHovered ? 1 : 0.4}
                    transform={isHovered ? `scale(1.04) translate(-${center * 0.04}, -${center * 0.04})` : ''}
                    onMouseEnter={() => setHoveredDept(slice.department)}
                    onMouseLeave={() => setHoveredDept(null)}
                  />
                );
              })}
            </svg>

            {/* Donut Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-2xl font-bold text-gray-900 leading-none">
                {totalAttended}
              </span>
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mt-0.5">
                {totalAttended === 1 ? 'Diretoria' : 'Diretorias'}
              </span>
            </div>
          </div>

          {/* Legend and breakdown */}
          <div className="flex-1 w-full space-y-2">
            {slices.map((slice) => {
              const isHovered = hoveredDept === slice.department;
              return (
                <div
                  key={slice.department}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                    isHovered ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                  onMouseEnter={() => setHoveredDept(slice.department)}
                  onMouseLeave={() => setHoveredDept(null)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="font-semibold text-gray-900 truncate">
                      {slice.name}
                    </span>
                    <span className="text-gray-400 uppercase text-[10px]">
                      ({slice.department})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <span className="text-gray-600">
                      {slice.visits_count} {slice.visits_count === 1 ? 'visita' : 'visitas'}
                    </span>
                    <span className="font-semibold text-forest-700 min-w-[42px] text-right">
                      {slice.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
