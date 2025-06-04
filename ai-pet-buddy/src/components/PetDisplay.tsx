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

  const getPetBodyColor = (level: number) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
    return colors[Math.min(level - 1, colors.length - 1)];
  };

  return (
    <div className="pet-display">
      <div className="pet-container">
        <div 
          className={`pet-body ${pet.expression}`}
          style={{ backgroundColor: getPetBodyColor(pet.stats.level) }}
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
