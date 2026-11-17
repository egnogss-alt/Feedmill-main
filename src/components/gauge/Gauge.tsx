import { ReadingWithStatus, Thresholds } from '../../types';

interface GaugeProps {
  reading: ReadingWithStatus;
  /** Green/Yellow/Red band for this reading kind, also the scale of the gauge. */
  thresholds: Thresholds;
  size?: number;
}

const statusColors: Record<ReadingWithStatus['status'], string> = {
  normal: '#22c55e',
  warning: '#eab308',
  critical: '#ef4444',
  offline: '#9ca3af',
};

export const Gauge = ({ reading, thresholds, size = 120 }: GaugeProps) => {
  const { min, max } = thresholds;
  const { value, unit, status, name } = reading;
  
  // Calculate percentage
  const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const angle = percentage * 270 - 135; // -135 to 135 degrees
  
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage);
  
  const color = statusColors[status];
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={8}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
          {/* Center value */}
          <text
            x={size / 2}
            y={size / 2 + 5}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={size * 0.18}
            fontWeight="600"
            fill="#1f2937"
          >
            {value}
          </text>
          {/* Unit */}
          <text
            x={size / 2}
            y={size / 2 + size * 0.18}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={size * 0.08}
            fill="#6b7280"
          >
            {unit}
          </text>
        </svg>
        
        {/* Status indicator */}
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1"
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs font-medium text-gray-600 capitalize">
            {status}
          </span>
        </div>
      </div>
      
      <div className="mt-2 text-center">
        <p className="text-sm font-medium text-gray-900">{name}</p>
        <p className="text-xs text-gray-500">
          Range: {min}–{max} {unit}
        </p>
      </div>
    </div>
  );
};