import { useMemo } from 'react';
import type { TimelinePoint } from '../types';

interface TimelineChartProps {
  data: TimelinePoint[];
  prevClose: number;
  width?: number;
  height?: number;
}

export function TimelineChart({ data, prevClose, width = 280, height = 100 }: TimelineChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const prices = data.map(d => d.price);
    const avgPrices = data.map(d => d.avgPrice);
    const allValues = [...prices, ...avgPrices, prevClose];
    
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const range = maxValue - minValue || 1;
    
    const padding = { top: 5, right: 5, bottom: 5, left: 5 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const getX = (index: number) => padding.left + (index / (data.length - 1)) * chartWidth;
    const getY = (value: number) => padding.top + ((maxValue - value) / range) * chartHeight;
    
    // 生成价格曲线路径
    const pricePath = data.map((d, i) => {
      const x = getX(i);
      const y = getY(d.price);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');
    
    // 生成均价线路径
    const avgPath = data.map((d, i) => {
      const x = getX(i);
      const y = getY(d.avgPrice);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');
    
    // 生成填充区域（价格线下方）
    const fillPath = pricePath + 
      ` L ${getX(data.length - 1)} ${height - padding.bottom}` +
      ` L ${padding.left} ${height - padding.bottom} Z`;
    
    // 昨收线 Y 坐标
    const prevCloseY = getY(prevClose);
    
    // 最后一个点
    const lastPoint = data[data.length - 1];
    const lastX = getX(data.length - 1);
    const lastY = getY(lastPoint.price);
    
    return {
      pricePath,
      avgPath,
      fillPath,
      prevCloseY,
      lastX,
      lastY,
      lastPrice: lastPoint.price,
      isPositive: lastPoint.price >= prevClose,
    };
  }, [data, prevClose, width, height]);

  if (!chartData) {
    return (
      <div className="timeline-chart-empty">
        暂无分时数据
      </div>
    );
  }

  return (
    <div className="timeline-chart">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* 背景网格 */}
        <defs>
          <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={chartData.isPositive ? 'rgba(255, 68, 102, 0.3)' : 'rgba(0, 204, 102, 0.3)'} />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </linearGradient>
        </defs>
        
        {/* 填充区域 */}
        <path
          d={chartData.fillPath}
          fill="url(#priceGradient)"
        />
        
        {/* 昨收价格线 */}
        <line
          x1={5}
          y1={chartData.prevCloseY}
          x2={width - 5}
          y2={chartData.prevCloseY}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth={1}
          strokeDasharray="4 2"
        />
        
        {/* 均价线 */}
        <path
          d={chartData.avgPath}
          fill="none"
          stroke="rgba(255, 170, 0, 0.8)"
          strokeWidth={1.5}
        />
        
        {/* 价格曲线 */}
        <path
          d={chartData.pricePath}
          fill="none"
          stroke={chartData.isPositive ? '#ff4466' : '#00cc66'}
          strokeWidth={1.5}
        />
        
        {/* 当前价格点 */}
        <circle
          cx={chartData.lastX}
          cy={chartData.lastY}
          r={3}
          fill={chartData.isPositive ? '#ff4466' : '#00cc66'}
        />
      </svg>
      
      <div className="timeline-chart-legend">
        <span className="legend-item legend-price">
          <span className="legend-line" style={{ background: chartData.isPositive ? '#ff4466' : '#00cc66' }} />
          价格
        </span>
        <span className="legend-item legend-avg">
          <span className="legend-line" style={{ background: '#ffaa00' }} />
          均价
        </span>
      </div>
    </div>
  );
}

