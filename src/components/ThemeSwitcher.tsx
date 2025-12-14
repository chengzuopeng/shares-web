import { motion } from 'framer-motion';
import type { Theme } from '../types';

interface ThemeSwitcherProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const themes: { id: Theme; label: string; emoji: string; color: string }[] = [
  { id: 'cyber', label: '赛博朋克', emoji: '🌃', color: '#00f0ff' },
  { id: 'aurora', label: '极光幻境', emoji: '🌌', color: '#00ff88' },
  { id: 'sunset', label: '落日熔金', emoji: '🌅', color: '#ff6b35' },
  { id: 'midnight', label: '午夜星空', emoji: '🌙', color: '#8b5cf6' },
];

export function ThemeSwitcher({ currentTheme, onThemeChange }: ThemeSwitcherProps) {
  return (
    <motion.div 
      className="theme-switcher"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <span className="theme-label">🎨 主题</span>
      <div className="theme-options">
        {themes.map((theme) => (
          <motion.button
            key={theme.id}
            className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
            onClick={() => onThemeChange(theme.id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              '--theme-color': theme.color,
            } as React.CSSProperties}
          >
            <span className="theme-emoji">{theme.emoji}</span>
            <span className="theme-name">{theme.label}</span>
            {currentTheme === theme.id && (
              <motion.span
                className="theme-active-indicator"
                layoutId="activeTheme"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

