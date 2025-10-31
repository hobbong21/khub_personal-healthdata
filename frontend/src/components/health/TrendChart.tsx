import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine
} from 'recharts';
import { VitalSignTrend } from '../../types/health';

interface TrendChartProps {
  trendData: VitalSignTrend;
  type: string;
  color: string;
  unit: string;
}

const TrendChart: React.FC<TrendChartProps> = ({ trendData, type, color, unit }) => {
  // 차트 데이터 변환
  const chartData = trendData.data.map(point => {
    const date = new Date(point.date);
    let value: number;
    let systolic: number | undefined;
    let diastolic: number | undefined;

    if (typeof point.value === 'object' && 'systolic' in point.value) {
      // 혈압의 경우
      systolic = point.value.systolic;
      diastolic = point.value.diastolic;
      value = systolic; // 메인 라인은 수축기압
    } else {
      value = point.value as number;
    }

    return {
      date: date.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric' 
      }),
      fullDate: date.toISOString(),
      value,
      systolic,
      diastolic,
      average: point.average
    };
  });

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          {type === 'blood_pressure' ? (
            <div className="tooltip-content">
              <p className="tooltip-value">
                <span className="tooltip-color" style={{ backgroundColor: color }}></span>
                수축기압: {data.systolic} {unit}
              </p>
              <p className="tooltip-value">
                <span className="tooltip-color" style={{ backgroundColor: '#94A3B8' }}></span>
                이완기압: {data.diastolic} {unit}
              </p>
            </div>
          ) : (
            <div className="tooltip-content">
              <p className="tooltip-value">
                <span className="tooltip-color" style={{ backgroundColor: color }}></span>
                {payload[0].value} {unit}
              </p>
              {data.average && (
                <p className="tooltip-average">
                  평균: {data.average} {unit}
                </p>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Y축 도메인 계산
  const getYAxisDomain = () => {
    if (type === 'blood_pressure') {
      const allValues = chartData.flatMap(d => [d.systolic || 0, d.diastolic || 0]);
      const min = Math.min(...allValues);
      const max = Math.max(...allValues);
      const padding = (max - min) * 0.1;
      return [Math.max(0, min - padding), max + padding];
    } else {
      const values = chartData.map(d => d.value);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const padding = (max - min) * 0.1;
      return [Math.max(0, min - padding), max + padding];
    }
  };

  // 정상 범위 참조선 (혈압의 경우)
  const getNormalRangeLines = () => {
    if (type === 'blood_pressure') {
      return (
        <>
          <ReferenceLine y={120} stroke="#10B981" strokeDasharray="5 5" opacity={0.6} />
          <ReferenceLine y={80} stroke="#10B981" strokeDasharray="5 5" opacity={0.6} />
        </>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="chart-empty">
        <div className="empty-state">
          <span className="empty-icon">📊</span>
          <p>표시할 데이터가 없습니다</p>
          <p className="empty-subtitle">바이탈 사인을 기록하여 트렌드를 확인하세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trend-chart">
      <ResponsiveContainer width="100%" height={300}>
        {type === 'blood_pressure' ? (
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              domain={getYAxisDomain()}
            />
            <Tooltip content={<CustomTooltip />} />
            {getNormalRangeLines()}
            
            {/* 수축기압 라인 */}
            <Line
              type="monotone"
              dataKey="systolic"
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
            
            {/* 이완기압 라인 */}
            <Line
              type="monotone"
              dataKey="diastolic"
              stroke="#94A3B8"
              strokeWidth={2}
              dot={{ fill: '#94A3B8', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#94A3B8', strokeWidth: 2 }}
            />
          </LineChart>
        ) : (
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id={`colorGradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              domain={getYAxisDomain()}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              fillOpacity={1}
              fill={`url(#colorGradient-${type})`}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
            
            {/* 평균선 (있는 경우) */}
            {chartData.some(d => d.average) && (
              <Line
                type="monotone"
                dataKey="average"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 4, stroke: '#F59E0B', strokeWidth: 2 }}
              />
            )}
          </AreaChart>
        )}
      </ResponsiveContainer>
      
      {/* 차트 범례 */}
      <div className="chart-legend">
        {type === 'blood_pressure' ? (
          <>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: color }}></span>
              <span className="legend-label">수축기압</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#94A3B8' }}></span>
              <span className="legend-label">이완기압</span>
            </div>
            <div className="legend-item">
              <span className="legend-line normal"></span>
              <span className="legend-label">정상 범위 (120/80)</span>
            </div>
          </>
        ) : (
          <>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: color }}></span>
              <span className="legend-label">측정값</span>
            </div>
            {chartData.some(d => d.average) && (
              <div className="legend-item">
                <span className="legend-line average"></span>
                <span className="legend-label">평균</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TrendChart;