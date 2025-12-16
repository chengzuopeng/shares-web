import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface StartButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export function StartButton({ onClick, isLoading }: StartButtonProps) {
  return (
    <motion.div
      className="start-button-container"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.button
        className="start-button"
        onClick={onClick}
        disabled={isLoading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="button-bg" />
        <span className="button-glow" />
        <span className="button-content">
          <motion.span 
            className="button-icon"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Zap size={28} />
          </motion.span>
          <span className="button-text">开始分析</span>
        </span>
        <span className="button-shine" />
      </motion.button>
      
      <div className="button-rings">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="ring"
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ 
              scale: [0.8, 1.2, 0.8],
              opacity: [0.5, 0.2, 0.5]
            }}
            transition={{
              duration: 3,
              delay: i * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

