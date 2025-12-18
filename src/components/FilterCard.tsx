import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Check, ToggleLeft, ToggleRight, RotateCcw } from 'lucide-react';
import type { FilterConditions } from '../types';

interface FilterCardProps {
  filters: FilterConditions;
  onFiltersChange: (filters: FilterConditions) => void;
  onReset: () => void;
}

type NumericFilterKey = Exclude<keyof FilterConditions, 'excludeST'>;

interface FilterItemProps {
  label: string;
  minValue: number;
  maxValue?: number;
  minKey: NumericFilterKey;
  maxKey?: NumericFilterKey;
  unit?: string;
  isEditing: boolean;
  filters: FilterConditions;
  onFilterChange: (key: NumericFilterKey, value: number) => void;
}

function FilterItem({ 
  label, 
  minValue, 
  maxValue, 
  minKey, 
  maxKey, 
  unit = '', 
  isEditing, 
  filters,
  onFilterChange 
}: FilterItemProps) {
  return (
    <motion.div 
      className="filter-item"
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <span className="filter-label">{label}</span>
      <div className="filter-value">
        {isEditing ? (
          <>
            <input
              type="number"
              value={filters[minKey] as number}
              onChange={(e) => onFilterChange(minKey, parseFloat(e.target.value) || 0)}
              className="filter-input"
            />
            {maxKey && (
              <>
                <span className="filter-separator">~</span>
                <input
                  type="number"
                  value={filters[maxKey] as number}
                  onChange={(e) => onFilterChange(maxKey, parseFloat(e.target.value) || 0)}
                  className="filter-input"
                />
              </>
            )}
            <span className="filter-unit">{unit}</span>
          </>
        ) : (
          <span className="filter-display">
            {maxValue !== undefined ? `${minValue} ~ ${maxValue}` : `≥ ${minValue}`}
            <span className="filter-unit">{unit}</span>
          </span>
        )}
      </div>
    </motion.div>
  );
}

interface ToggleItemProps {
  label: string;
  value: boolean;
  isEditing: boolean;
  onChange: (value: boolean) => void;
}

function ToggleItem({ label, value, isEditing, onChange }: ToggleItemProps) {
  return (
    <motion.div 
      className="filter-item filter-item-toggle"
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <span className="filter-label">{label}</span>
      <div className="filter-value">
        {isEditing ? (
          <button 
            className={`filter-toggle ${value ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onChange(!value);
            }}
          >
            {value ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
            <span>{value ? '开启' : '关闭'}</span>
          </button>
        ) : (
          <span className="filter-display">
            {value ? '开启' : '关闭'}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function FilterCard({ filters, onFiltersChange, onReset }: FilterCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleFilterChange = (key: NumericFilterKey, value: number) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleToggleChange = (key: 'excludeST', value: boolean) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleCardClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReset();
  };

  return (
    <motion.div
      className={`filter-card ${isEditing ? 'editing' : ''}`}
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={!isEditing ? { scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" } : undefined}
    >
      <div className="filter-card-header">
        <SlidersHorizontal className="filter-card-icon" size={24} />
        <h3 className="filter-card-title">筛选条件</h3>
        <div className="filter-header-actions">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editing-actions"
                className="filter-actions"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <motion.button
                  className="filter-reset-btn"
                  onClick={handleReset}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw size={14} /> 恢复默认
                </motion.button>
                <motion.button
                  className="filter-save-btn"
                  onClick={handleSave}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Check size={16} /> 保存
                </motion.button>
              </motion.div>
            ) : (
              <motion.span
                key="hint"
                className="filter-edit-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                点击编辑
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="filter-grid">
        <FilterItem
          label="流通市值"
          minValue={filters.marketCapMin}
          maxValue={filters.marketCapMax}
          minKey="marketCapMin"
          maxKey="marketCapMax"
          unit="亿"
          isEditing={isEditing}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        <FilterItem
          label="量比"
          minValue={filters.volumeRatioMin}
          minKey="volumeRatioMin"
          isEditing={isEditing}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        <FilterItem
          label="当日涨幅"
          minValue={filters.changePercentMin}
          maxValue={filters.changePercentMax}
          minKey="changePercentMin"
          maxKey="changePercentMax"
          unit="%"
          isEditing={isEditing}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        <FilterItem
          label="换手率"
          minValue={filters.turnoverRateMin}
          maxValue={filters.turnoverRateMax}
          minKey="turnoverRateMin"
          maxKey="turnoverRateMax"
          unit="%"
          isEditing={isEditing}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        <ToggleItem
          label="过滤ST股票"
          value={filters.excludeST}
          isEditing={isEditing}
          onChange={(value) => handleToggleChange('excludeST', value)}
        />
        <FilterItem
          label="分时强度"
          minValue={filters.timelineAboveAvgRatio}
          minKey="timelineAboveAvgRatio"
          unit="%"
          isEditing={isEditing}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>

      <div className="filter-card-glow" />
    </motion.div>
  );
}

