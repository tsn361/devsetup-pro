import React, { useState } from 'react';
import ToolCard from './ToolCard';
import '../styles/CategorySection.css';

function CategorySection({ category, selectedTools, onToolToggle, onUninstall }) {
  const [expanded, setExpanded] = useState(true);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const selectedCount = category.tools.filter(tool => 
    selectedTools.includes(tool.id)
  ).length;

  return (
    <div className="category-section">
      <div className="category-header" onClick={toggleExpanded}>
        <div className="category-title">
          <span className="category-icon">{expanded ? '▼' : '▶'}</span>
          <h2>{category.name}</h2>
          <span className="category-count">
            {category.tools.length} tools
            {selectedCount > 0 && ` • ${selectedCount} selected`}
          </span>
        </div>
        <p className="category-description">{category.description}</p>
      </div>

      {expanded && (
        <div className="category-tools">
          {category.tools.map(tool => (
            <ToolCard
              key={tool.id}
              tool={tool}
              selected={selectedTools.includes(tool.id)}
              onToggle={onToolToggle}
              onUninstall={onUninstall}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CategorySection;
