import { motion } from 'framer-motion';

interface LoadingOverlayProps {
  progress: {
    completed: number;
    total: number;
    stage?: string;
  };
}

export function LoadingOverlay({ progress }: LoadingOverlayProps) {
  const percentage = progress.total > 0 
    ? Math.round((progress.completed / progress.total) * 100) 
    : 0;

  return (
    <motion.div
      className="loading-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="loading-content">
        {/* 主旋转环 */}
        <div className="loading-spinner-container">
          <motion.div
            className="loading-ring loading-ring-1"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="loading-ring loading-ring-2"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="loading-ring loading-ring-3"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          
          {/* 中心进度数字 */}
          <div className="loading-center">
            <motion.span
              className="loading-percentage"
              key={percentage}
              initial={{ scale: 1.2, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {percentage}%
            </motion.span>
          </div>
        </div>

        {/* 进度条 */}
        <div className="loading-progress-bar">
          <motion.div
            className="loading-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
          <div className="loading-progress-glow" style={{ left: `${percentage}%` }} />
        </div>

        {/* 状态文本 */}
        <div className="loading-status">
          <motion.p
            className="loading-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {progress.stage || '正在扫描全市场股票数据...'}
          </motion.p>
          <p className="loading-detail">
            {progress.total > 0 
              ? `已处理 ${progress.completed} / ${progress.total}`
              : '正在初始化连接...'
            }
          </p>
        </div>

        {/* 装饰性粒子 */}
        <div className="loading-particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.span
              key={i}
              className="loading-particle"
              initial={{ 
                x: 0, 
                y: 0, 
                scale: 0,
                opacity: 0 
              }}
              animate={{ 
                x: Math.cos(i * 18 * Math.PI / 180) * (80 + Math.random() * 40),
                y: Math.sin(i * 18 * Math.PI / 180) * (80 + Math.random() * 40),
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

