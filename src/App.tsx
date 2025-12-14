import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StockSDK } from 'stock-sdk';
import type { FullQuote } from 'stock-sdk';
import { TrendingUp, Target, ChevronLeft, SearchX } from 'lucide-react';
import { FilterCard } from './components/FilterCard';
import { StartButton } from './components/StartButton';
import { LoadingOverlay } from './components/LoadingOverlay';
import { StockCard } from './components/StockCard';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { ParticleBackground } from './components/ParticleBackground';
import type { FilterConditions, StockData, Theme } from './types';

const defaultFilters: FilterConditions = {
  marketCapMin: 50,
  marketCapMax: 200,
  volumeRatioMin: 1,
  changePercentMin: 3,
  changePercentMax: 5,
  turnoverRateMin: 5,
  turnoverRateMax: 10,
};

function App() {
  const [theme, setTheme] = useState<Theme>('cyber');
  const [filters, setFilters] = useState<FilterConditions>(defaultFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ completed: 0, total: 0 });
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const filterStocks = useCallback((quotes: FullQuote[], conditions: FilterConditions): StockData[] => {
    return quotes
      .filter((quote) => {
        const marketCap = quote.circulatingMarketCap;
        const volumeRatio = quote.volumeRatio;
        const changePercent = quote.changePercent;
        const turnoverRate = quote.turnoverRate;

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

  const handleStartAnalysis = useCallback(async () => {
    setIsLoading(true);
    setLoadingProgress({ completed: 0, total: 0 });
    setStocks([]);

    try {
      const sdk = new StockSDK();
      const quotes = await sdk.getAllAShareQuotes({
        batchSize: 500,
        concurrency: 5,
        onProgress: (completed, total) => {
          setLoadingProgress({ completed, total });
        },
      });

      const filteredStocks = filterStocks(quotes, filters);
      setStocks(filteredStocks);
      setHasAnalyzed(true);
    } catch (error) {
      console.error('获取股票数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, filterStocks]);

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
              <FilterCard filters={filters} onFiltersChange={setFilters} />
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

