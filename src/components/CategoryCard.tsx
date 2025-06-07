import React from 'react';
import '../styles/CategoryCard.css';

interface CategoryCardProps {
  name: string;
  itemCount: number;
  icon: string;
  isSelected: boolean;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  name,
  itemCount,
  icon,
  isSelected,
  onClick,
}) => {
  return (
    <div 
      className={`category-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="category-icon">
        <img src={icon} alt={name} />
      </div>
      <div className="category-info">
        <h3>{name}</h3>
        <p>{itemCount} items</p>
      </div>
    </div>
  );
};

export default CategoryCard; 