import { motion } from 'framer-motion';
import { Palette, Cpu, Moon, Sun, type LucideIcon } from 'lucide-react';
import type { Theme } from '../types';

interface ThemeSwitcherProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const themes: { id: Theme; label: string; icon: LucideIcon; color: string }[] = [
  { id: 'cyber', label: '赛博朋克', icon: Cpu, color: '#00f0ff' },
  { id: 'crystal', label: '晶莹剔透', icon: Sun, color: '#3b82f6' },
  { id: 'midnight', label: '午夜星空', icon: Moon, color: '#8b5cf6' },
];

export function ThemeSwitcher({ currentTheme, onThemeChange }: ThemeSwitcherProps) {
  return (
    <motion.div 
      className="theme-switcher"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <span className="theme-label"><Palette size={16} /> 主题</span>
      <div className="theme-options">
        {themes.map((theme) => {
          const IconComponent = theme.icon;
          return (
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
              <IconComponent className="theme-icon" size={20} />
              <span className="theme-name">{theme.label}</span>
              {currentTheme === theme.id && (
                <motion.span
                  className="theme-active-indicator"
                  layoutId="activeTheme"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

