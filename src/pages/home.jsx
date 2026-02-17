import React from 'react';
import { useTranslation } from 'react-i18next';

const categories = [
  { id: 1, name: "General Discussion", sub: "Talk about anything", posts: 120 },
  { id: 2, name: "Marketplace", sub: "Buy and Sell items", posts: 85 },
  { id: 3, name: "Technical Support", sub: "Get help from staff", posts: 210 }
];

function Home() {
  const { t } = useTranslation();
  return (
    <div className="forum-list">
      <div className="category-block">
        <div className="cat-header">{t('categories')}</div>
        {categories.map(cat => (
          <div key={cat.id} className="forum-row">
            <div className="forum-info">
              <h3>{cat.name}</h3>
              <p>{cat.sub}</p>
            </div>
            <div className="forum-meta">
              <span>{cat.posts} Posts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Home;