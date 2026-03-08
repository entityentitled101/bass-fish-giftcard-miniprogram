import React from 'react';
import { User, MapPin, BookOpen, Settings } from 'lucide-react';
import { NavigationItem } from '../types';

interface NavigationBarProps {
  currentPage: string;
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ currentPage, setCurrentPage }) => {
  // 导航项配置
  const navigationItems: NavigationItem[] = [
    { id: 'setup', name: '角色设定', icon: User },
    { id: 'traveling', name: '旅行中', icon: MapPin },
    { id: 'diary', name: '旅行日记', icon: BookOpen },
    { id: 'settings', name: '设置', icon: Settings }
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex space-x-8">
          {navigationItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  currentPage === item.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;