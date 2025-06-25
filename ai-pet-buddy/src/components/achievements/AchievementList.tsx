/**
 * @file AchievementList.tsx
 * @description Main achievements display component with filtering and categorization
 * 
 * Shows all achievements organized by category with filtering options,
 * progress tracking, and statistics summary.
 */

import React, { useState, useMemo } from 'react';
import type { AchievementState, Badge, Title, AchievementCategory } from '../../types/Achievement';
import AchievementItem from './AchievementItem';
import './AchievementList.css';

interface AchievementListProps {
  achievementState: AchievementState;
  onTitleActivate?: (titleId: string) => void;
  onAchievementClick?: (achievement: Badge | Title, type: 'badge' | 'title') => void;
  className?: string;
}

type FilterType = 'all' | 'unlocked' | 'locked' | 'in-progress';
type ViewType = 'badges' | 'titles' | 'both';

const AchievementList: React.FC<AchievementListProps> = ({
  achievementState,
  onTitleActivate,
  onAchievementClick,
  className = ''
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeView, setActiveView] = useState<ViewType>('both');
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');

  // Calculate statistics
  const stats = useMemo(() => {
    const totalBadges = achievementState.badges.length;
    const unlockedBadges = achievementState.badges.filter(b => b.unlocked).length;
    const totalTitles = achievementState.titles.length;
    const unlockedTitles = achievementState.titles.filter(t => t.unlocked).length;
    const activeTitle = achievementState.titles.find(t => t.active);

    return {
      totalBadges,
      unlockedBadges,
      totalTitles,
      unlockedTitles,
      activeTitle,
      badgeProgress: totalBadges > 0 ? (unlockedBadges / totalBadges) * 100 : 0,
      titleProgress: totalTitles > 0 ? (unlockedTitles / totalTitles) * 100 : 0
    };
  }, [achievementState]);

  // Get available categories
  const categories = useMemo(() => {
    const allCategories = new Set<AchievementCategory>();
    achievementState.badges.forEach(b => allCategories.add(b.category));
    achievementState.titles.forEach(t => allCategories.add(t.category));
    return Array.from(allCategories).sort();
  }, [achievementState]);

  // Filter and sort achievements
  const filteredAchievements = useMemo(() => {
    let badges = [...achievementState.badges];
    let titles = [...achievementState.titles];

    // Filter by category
    if (selectedCategory !== 'all') {
      badges = badges.filter(b => b.category === selectedCategory);
      titles = titles.filter(t => t.category === selectedCategory);
    }

    // Filter by status
    switch (activeFilter) {
      case 'unlocked':
        badges = badges.filter(b => b.unlocked);
        titles = titles.filter(t => t.unlocked);
        break;
      case 'locked':
        badges = badges.filter(b => !b.unlocked);
        titles = titles.filter(t => !t.unlocked);
        break;
      case 'in-progress':
        badges = badges.filter(b => !b.unlocked && b.progress > 0);
        titles = titles.filter(t => !t.unlocked);
        break;
    }

    // Sort achievements
    const sortFn = (a: Badge | Title, b: Badge | Title) => {
      // Unlocked first, then by rarity
      if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
      
      const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
      const aRarity = rarityOrder[a.rarity];
      const bRarity = rarityOrder[b.rarity];
      
      if (aRarity !== bRarity) return aRarity - bRarity;
      
      // For badges, sort by progress if locked
      if ('progress' in a && 'progress' in b && !a.unlocked && !b.unlocked) {
        return b.progress - a.progress;
      }
      
      return a.name.localeCompare(b.name);
    };

    badges.sort(sortFn);
    titles.sort(sortFn);

    return { badges, titles };
  }, [achievementState, activeFilter, selectedCategory]);

  const handleTitleClick = (title: Title) => {
    if (title.unlocked && onTitleActivate) {
      onTitleActivate(title.id);
    }
    if (onAchievementClick) {
      onAchievementClick(title, 'title');
    }
  };

  const handleBadgeClick = (badge: Badge) => {
    if (onAchievementClick) {
      onAchievementClick(badge, 'badge');
    }
  };

  const getCategoryIcon = (category: AchievementCategory): string => {
    switch (category) {
      case 'evolution': return '🦋';
      case 'game': return '🎮';
      case 'care': return '💝';
      case 'time': return '⏰';
      case 'level': return '⭐';
      default: return '🏆';
    }
  };

  const getCategoryName = (category: AchievementCategory): string => {
    switch (category) {
      case 'evolution': return 'Evolution';
      case 'game': return 'Gaming';
      case 'care': return 'Care';
      case 'time': return 'Time';
      case 'level': return 'Level';
      default: return 'Other';
    }
  };

  const listClasses = [
    'achievement-list',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={listClasses}>
      {/* Header with Stats */}
      <div className="achievement-list__header">
        <div className="achievement-list__title">
          <h2>🏆 Achievements</h2>
          {stats.activeTitle && (
            <div className="achievement-list__active-title">
              <span className="achievement-list__active-title-icon">👑</span>
              <span className="achievement-list__active-title-text">
                {stats.activeTitle.name}
              </span>
            </div>
          )}
        </div>
        
        <div className="achievement-list__stats">
          <div className="achievement-list__stat">
            <span className="achievement-list__stat-label">Badges</span>
            <span className="achievement-list__stat-value">
              {stats.unlockedBadges}/{stats.totalBadges}
            </span>
            <div className="achievement-list__stat-bar">
              <div 
                className="achievement-list__stat-fill"
                style={{ width: `${stats.badgeProgress}%` }}
              />
            </div>
          </div>
          
          <div className="achievement-list__stat">
            <span className="achievement-list__stat-label">Titles</span>
            <span className="achievement-list__stat-value">
              {stats.unlockedTitles}/{stats.totalTitles}
            </span>
            <div className="achievement-list__stat-bar">
              <div 
                className="achievement-list__stat-fill"
                style={{ width: `${stats.titleProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="achievement-list__filters">
        {/* View Type Filter */}
        <div className="achievement-list__filter-group">
          <label className="achievement-list__filter-label">View:</label>
          <div className="achievement-list__filter-buttons">
            {(['both', 'badges', 'titles'] as ViewType[]).map(view => (
              <button
                key={view}
                className={`achievement-list__filter-button ${
                  activeView === view ? 'achievement-list__filter-button--active' : ''
                }`}
                onClick={() => setActiveView(view)}
              >
                {view === 'both' ? '🏆👑 Both' : 
                 view === 'badges' ? '🏆 Badges' : '👑 Titles'}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="achievement-list__filter-group">
          <label className="achievement-list__filter-label">Status:</label>
          <div className="achievement-list__filter-buttons">
            {(['all', 'unlocked', 'locked', 'in-progress'] as FilterType[]).map(filter => (
              <button
                key={filter}
                className={`achievement-list__filter-button ${
                  activeFilter === filter ? 'achievement-list__filter-button--active' : ''
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter === 'all' ? 'All' :
                 filter === 'unlocked' ? '✅ Unlocked' :
                 filter === 'locked' ? '🔒 Locked' : '⏳ In Progress'}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="achievement-list__filter-group">
          <label className="achievement-list__filter-label">Category:</label>
          <div className="achievement-list__filter-buttons">
            <button
              className={`achievement-list__filter-button ${
                selectedCategory === 'all' ? 'achievement-list__filter-button--active' : ''
              }`}
              onClick={() => setSelectedCategory('all')}
            >
              🌟 All
            </button>
            {categories.map(category => (
              <button
                key={category}
                className={`achievement-list__filter-button ${
                  selectedCategory === category ? 'achievement-list__filter-button--active' : ''
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {getCategoryIcon(category)} {getCategoryName(category)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Achievement Lists */}
      <div className="achievement-list__content">
        {/* Badges Section */}
        {(activeView === 'both' || activeView === 'badges') && (
          <div className="achievement-list__section">
            {activeView === 'both' && (
              <h3 className="achievement-list__section-title">
                🏆 Badges ({filteredAchievements.badges.length})
              </h3>
            )}
            <div className="achievement-list__grid">
              {filteredAchievements.badges.map(badge => (
                <AchievementItem
                  key={badge.id}
                  achievement={badge}
                  type="badge"
                  onClick={handleBadgeClick}
                  showProgress={true}
                  size="medium"
                />
              ))}
            </div>
            {filteredAchievements.badges.length === 0 && (
              <div className="achievement-list__empty">
                No badges match the current filters.
              </div>
            )}
          </div>
        )}

        {/* Titles Section */}
        {(activeView === 'both' || activeView === 'titles') && (
          <div className="achievement-list__section">
            {activeView === 'both' && (
              <h3 className="achievement-list__section-title">
                👑 Titles ({filteredAchievements.titles.length})
              </h3>
            )}
            <div className="achievement-list__grid">
              {filteredAchievements.titles.map(title => (
                <AchievementItem
                  key={title.id}
                  achievement={title}
                  type="title"
                  onClick={handleTitleClick}
                  showProgress={false}
                  size="medium"
                  isActive={title.active}
                />
              ))}
            </div>
            {filteredAchievements.titles.length === 0 && (
              <div className="achievement-list__empty">
                No titles match the current filters.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementList;