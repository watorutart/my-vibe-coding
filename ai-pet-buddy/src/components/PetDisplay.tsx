import React from 'react';
import type { Pet } from '../types/Pet';
import './PetDisplay.css';

interface PetDisplayProps {
  pet: Pet;
}

const PetDisplay: React.FC<PetDisplayProps> = ({ pet }) => {
  const getExpressionEmoji = (expression: Pet['expression']) => {
    switch (expression) {
      case 'happy': return '😊';
      case 'excited': return '🤩';
      case 'sad': return '😢';
      case 'tired': return '😴';
      default: return '😐';
    }
  };

  const getAccessoryIcon = (type: string | undefined) => {
    if (!type) return null;
    switch (type) {
      case 'hat': return '🎩';
      case 'ribbon': return '🎀';
      case 'glasses': return '👓';
      case 'necklace': return '📿';
      default: return '✨'; // デフォルトアイコンまたはnull
    }
  };

  return (
    <div className="pet-display">
      <div className="pet-container">
        <div 
          className={`pet-body ${pet.expression}`}
          style={{ backgroundColor: pet.color || '#FF6B6B' }} // カスタマイズされた色を使用、なければデフォルト
        >
          <div className="pet-face">
            <div className="pet-eyes">
              <div className="eye left-eye"></div>
              <div className="eye right-eye"></div>
            </div>
            <div className="pet-expression">
              {getExpressionEmoji(pet.expression)}
            </div>
          </div>
          <div className="pet-accessories">
            {pet.accessories && pet.accessories.map(acc => (
              <div key={acc.id} className={`accessory ${acc.type}`}>
                {getAccessoryIcon(acc.type)}
              </div>
            ))}
          </div>
          <div className="pet-wings">
            <div className="wing left-wing"></div>
            <div className="wing right-wing"></div>
          </div>
        </div>
        <div className="pet-name">{pet.name}</div>
        <div className="pet-level">Level {pet.stats.level}</div>
      </div>
    </div>
  );
};

export default PetDisplay;
