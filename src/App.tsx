import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StockSDK } from 'stock-sdk';
import type { FullQuote, TodayTimelineResponse } from 'stock-sdk';
import { TrendingUp, Target, ChevronLeft, SearchX } from 'lucide-react';
import { FilterCard } from './components/FilterCard';
import { StartButton } from './components/StartButton';
import { LoadingOverlay } from './components/LoadingOverlay';
import { StockCard } from './components/StockCard';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { ParticleBackground } from './components/ParticleBackground';
import type { FilterConditions, StockData, TimelinePoint, Theme } from './types';

const STORAGE_KEY = 'stock-filter-settings';

export const defaultFilters: FilterConditions = {
  marketCapMin: 50,
  marketCapMax: 200,
  volumeRatioMin: 1.2,
  changePercentMin: 3,
  changePercentMax: 5,
  turnoverRateMin: 5,
  turnoverRateMax: 10,
  excludeST: true,
  timelineAboveAvgRatio: 80,
};

// 从 localStorage 读取筛选条件
const loadFiltersFromStorage = (): FilterConditions => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // 合并默认值，确保新增字段有默认值
      return { ...defaultFilters, ...parsed };
    }
  } catch (error) {
    console.warn('读取筛选条件失败:', error);
  }
  return defaultFilters;
};

// 保存筛选条件到 localStorage
const saveFiltersToStorage = (filters: FilterConditions): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch (error) {
    console.warn('保存筛选条件失败:', error);
  }
};

function App() {
  const [theme, setTheme] = useState<Theme>('cyber');
  const [filters, setFilters] = useState<FilterConditions>(loadFiltersFromStorage);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ completed: 0, total: 0, stage: '' });
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const sdkRef = useRef<StockSDK | null>(null);

  // 筛选条件变化时保存到 localStorage
  useEffect(() => {
    saveFiltersToStorage(filters);
  }, [filters]);

  // 恢复默认设置
  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // 基础条件筛选（不含分时结构）
  const filterStocksBasic = useCallback((quotes: FullQuote[], conditions: FilterConditions): Omit<StockData, 'timeline' | 'timelineAboveAvgRatio'>[] => {
    return quotes
      .filter((quote) => {
        const marketCap = quote.circulatingMarketCap;
        const volumeRatio = quote.volumeRatio;
        const changePercent = quote.changePercent;
        const turnoverRate = quote.turnoverRate;
        const name = quote.name;

        // ST 过滤
        if (conditions.excludeST && (name.includes('ST') || name.includes('*ST'))) {
          return false;
        }

        if (marketCap === null || marketCap < conditions.marketCapMin || marketCap > conditions.marketCapMax) {
          return false;
        }
        if (volumeRatio === null || volumeRatio < conditions.volumeRatioMin) {
          return false;
        }
        if (changePercent < conditions.changePercentMin || changePercent > conditions.changePercentMax) {
          return false;
        }
        if (turnoverRate === null || turnoverRate < conditions.turnoverRateMin || turnoverRate > conditions.turnoverRateMax) {
          return false;
        }
        return true;
      })
      .map((quote) => ({
        code: quote.code,
        name: quote.name,
        price: quote.price,
        changePercent: quote.changePercent,
        change: quote.change,
        volume: quote.volume,
        amount: quote.amount,
        turnoverRate: quote.turnoverRate,
        volumeRatio: quote.volumeRatio,
        circulatingMarketCap: quote.circulatingMarketCap,
        totalMarketCap: quote.totalMarketCap,
        pe: quote.pe,
        pb: quote.pb,
        high: quote.high,
        low: quote.low,
        open: quote.open,
        prevClose: quote.prevClose,
      }))
      .sort((a, b) => b.changePercent - a.changePercent);
  }, []);

  // 计算分时强度（价格高于均价的比例）
  const calculateTimelineRatio = (timeline: TodayTimelineResponse): { ratio: number; points: TimelinePoint[] } => {
    if (!timeline.data || timeline.data.length === 0) {
      return { ratio: 0, points: [] };
    }
    
    const points: TimelinePoint[] = timeline.data.map(item => ({
      time: item.time,
      price: item.price,
      avgPrice: item.avgPrice,
    }));
    
    const aboveAvgCount = points.filter(p => p.price >= p.avgPrice).length;
    const ratio = (aboveAvgCount / points.length) * 100;
    
    return { ratio, points };
  };

  // 获取分时数据并筛选
  const filterWithTimeline = useCallback(async (
    basicStocks: Omit<StockData, 'timeline' | 'timelineAboveAvgRatio'>[],
    sdk: StockSDK,
    minRatio: number,
    onProgress: (completed: number, total: number) => void
  ): Promise<StockData[]> => {
    const results: StockData[] = [];
    const total = basicStocks.length;
    
    // 并发获取分时数据，每次最多 5 个
    const batchSize = 5;
    for (let i = 0; i < basicStocks.length; i += batchSize) {
      const batch = basicStocks.slice(i, i + batchSize);
      const promises = batch.map(async (stock) => {
        try {
          // 构造股票代码格式
          const marketPrefix = stock.code.startsWith('6') || stock.code.startsWith('9') ? 'sh' : 
                              stock.code.startsWith('4') || stock.code.startsWith('8') ? 'bj' : 'sz';
          const fullCode = `${marketPrefix}${stock.code}`;
          
          const timeline = await sdk.getTodayTimeline(fullCode);
          const { ratio, points } = calculateTimelineRatio(timeline);
          
          if (ratio >= minRatio) {
            return {
              ...stock,
              timeline: points,
              timelineAboveAvgRatio: ratio,
            } as StockData;
          }
          return null;
        } catch (error) {
          console.warn(`获取 ${stock.code} 分时数据失败:`, error);
          return null;
        }
      });
      
      const batchResults = await Promise.all(promises);
      batchResults.forEach(result => {
        if (result) results.push(result);
      });
      
      onProgress(Math.min(i + batchSize, total), total);
    }
    
    return results.sort((a, b) => (b.timelineAboveAvgRatio || 0) - (a.timelineAboveAvgRatio || 0));
  }, []);

  const handleStartAnalysis = useCallback(async () => {
    setIsLoading(true);
    setLoadingProgress({ completed: 0, total: 0, stage: '获取行情数据' });
    setStocks([]);

    try {
      const sdk = new StockSDK();
      sdkRef.current = sdk;
      
      // 第一阶段：获取全市场行情
      const quotes = await sdk.getAllAShareQuotes({
        batchSize: 500,
        concurrency: 5,
        onProgress: (completed, total) => {
          setLoadingProgress({ completed, total, stage: '获取行情数据' });
        },
      });

      // 第二阶段：基础条件筛选
      setLoadingProgress({ completed: 0, total: 100, stage: '基础条件筛选' });
      const basicFilteredStocks = filterStocksBasic(quotes, filters);
      
      // 第三阶段：分时结构筛选
      setLoadingProgress({ completed: 0, total: basicFilteredStocks.length, stage: '分时结构筛选' });
      const finalStocks = await filterWithTimeline(
        basicFilteredStocks,
        sdk,
        filters.timelineAboveAvgRatio,
        (completed, total) => {
          setLoadingProgress({ completed, total, stage: '分时结构筛选' });
        }
      );
      
      setStocks(finalStocks);
      setHasAnalyzed(true);
    } catch (error) {
      console.error('获取股票数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, filterStocksBasic, filterWithTimeline]);

  return (
    <div className={`app theme-${theme}`}>
      <ParticleBackground />
      
      <header className="header">
        <motion.h1 
          className="title"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <TrendingUp className="title-icon" />
          <span className="title-text">一日持股法分析工具</span>
          <span className="title-glow" />
        </motion.h1>
        <ThemeSwitcher currentTheme={theme} onThemeChange={setTheme} />
      </header>

      <main className="main">
        <AnimatePresence mode="wait">
          {!hasAnalyzed ? (
            <motion.div
              key="start-screen"
              className="start-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              <StartButton onClick={handleStartAnalysis} isLoading={isLoading} />
              <FilterCard filters={filters} onFiltersChange={setFilters} onReset={handleResetFilters} />
            </motion.div>
          ) : (
            <motion.div
              key="results-screen"
              className="results-screen"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="results-header">
                <motion.div 
                  className="results-summary"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Target className="summary-icon" />
                  <span className="summary-text">
                    共筛选出 <strong>{stocks.length}</strong> 只符合条件的股票
                  </span>
                </motion.div>
                <motion.button
                  className="back-button"
                  onClick={() => setHasAnalyzed(false)}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronLeft size={18} /> 重新筛选
                </motion.button>
              </div>

              {stocks.length > 0 ? (
                <motion.div 
                  className="stock-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {stocks.map((stock, index) => (
                    <StockCard key={stock.code} stock={stock} index={index} />
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  className="no-results"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <SearchX className="no-results-icon" />
                  <p>没有找到符合条件的股票</p>
                  <p className="no-results-hint">请尝试调整筛选条件后重新分析</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isLoading && (
          <LoadingOverlay progress={loadingProgress} />
        )}
      </AnimatePresence>

      <footer className="footer">
        <span className="footer-text">本网站由</span>
        <a 
          href="https://www.upyun.com/?utm_source=lianmeng&utm_medium=referral" 
          target="_blank" 
          rel="noopener noreferrer"
          className="footer-link"
        >
          <img src="/upyun-logo.png" alt="又拍云" className="footer-logo" />
        </a>
        <span className="footer-text">提供CDN加速/云存储服务</span>
      </footer>
    </div>
  );
}

export default App;

