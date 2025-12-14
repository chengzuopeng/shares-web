import { motion } from 'framer-motion';
import type { StockData } from '../types';

interface StockCardProps {
  stock: StockData;
  index: number;
}

export function StockCard({ stock, index }: StockCardProps) {
  const isPositive = stock.changePercent >= 0;
  
  const formatNumber = (num: number | null, decimals = 2): string => {
    if (num === null) return '-';
    return num.toFixed(decimals);
  };

  // 生成雪球分时图链接
  const getXueqiuUrl = (code: string): string => {
    // code 格式如 "000858" 或 "600000"
    // 雪球链接格式: https://xueqiu.com/S/SZ000858 或 https://xueqiu.com/S/SH600000
    const market = code.startsWith('6') || code.startsWith('9') ? 'SH' : 'SZ';
    return `https://xueqiu.com/S/${market}${code}`;
  };

  const formatLargeNumber = (num: number): string => {
    if (num >= 100000000) {
      return (num / 100000000).toFixed(2) + '亿';
    } else if (num >= 10000) {
      return (num / 10000).toFixed(2) + '万';
    }
    return num.toFixed(2);
  };

  return (
    <motion.div
      className={`stock-card ${isPositive ? 'positive' : 'negative'}`}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.03,
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      {/* 卡片头部 */}
      <div className="stock-card-header">
        <div className="stock-info">
          <h3 className="stock-name">{stock.name}</h3>
          <span className="stock-code">{stock.code}</span>
        </div>
        <motion.div 
          className="stock-change-badge"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
        >
          <span className="change-icon">{isPositive ? '▲' : '▼'}</span>
          <span className="change-percent">{formatNumber(stock.changePercent)}%</span>
        </motion.div>
      </div>

      {/* 价格区域 */}
      <div className="stock-price-section">
        <div className="current-price">
          <span className="price-label">现价</span>
          <span className="price-value">{formatNumber(stock.price)}</span>
        </div>
        <div className="price-change">
          <span className="change-value">
            {isPositive ? '+' : ''}{formatNumber(stock.change)}
          </span>
        </div>
      </div>

      {/* 数据网格 */}
      <div className="stock-data-grid">
        <div className="data-item">
          <span className="data-label">流通市值</span>
          <span className="data-value">{formatNumber(stock.circulatingMarketCap)}亿</span>
        </div>
        <div className="data-item">
          <span className="data-label">量比</span>
          <span className="data-value">{formatNumber(stock.volumeRatio)}</span>
        </div>
        <div className="data-item">
          <span className="data-label">换手率</span>
          <span className="data-value">{formatNumber(stock.turnoverRate)}%</span>
        </div>
        <div className="data-item">
          <span className="data-label">成交额</span>
          <span className="data-value">{formatLargeNumber(stock.amount)}</span>
        </div>
      </div>

      {/* 价格区间 */}
      <div className="stock-range">
        <div className="range-item">
          <span className="range-label">最高</span>
          <span className="range-value high">{formatNumber(stock.high)}</span>
        </div>
        <div className="range-bar">
          <div 
            className="range-indicator"
            style={{
              left: `${((stock.price - stock.low) / (stock.high - stock.low || 1)) * 100}%`
            }}
          />
        </div>
        <div className="range-item">
          <span className="range-label">最低</span>
          <span className="range-value low">{formatNumber(stock.low)}</span>
        </div>
      </div>

      {/* 额外指标 */}
      <div className="stock-indicators">
        <div className="indicator">
          <span className="indicator-label">市盈率</span>
          <span className="indicator-value">{formatNumber(stock.pe)}</span>
        </div>
        <div className="indicator">
          <span className="indicator-label">市净率</span>
          <span className="indicator-value">{formatNumber(stock.pb)}</span>
        </div>
        <div className="indicator">
          <span className="indicator-label">开盘</span>
          <span className="indicator-value">{formatNumber(stock.open)}</span>
        </div>
        <div className="indicator">
          <span className="indicator-label">昨收</span>
          <span className="indicator-value">{formatNumber(stock.prevClose)}</span>
        </div>
      </div>

      {/* 雪球链接 */}
      <motion.a
        href={getXueqiuUrl(stock.code)}
        target="_blank"
        rel="noopener noreferrer"
        className="xueqiu-link"
        onClick={(e) => e.stopPropagation()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="xueqiu-icon">❄️</span>
        <span className="xueqiu-text">查看雪球分时图</span>
        <span className="xueqiu-arrow">→</span>
      </motion.a>

      {/* 装饰元素 */}
      <div className="stock-card-glow" />
      <div className="stock-card-border" />
    </motion.div>
  );
}

