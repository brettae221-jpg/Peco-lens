import React, { useState } from 'react';
import { User, AppView } from '../types';
import { DashboardIcon } from './icons/DashboardIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { UsersIcon } from './UsersIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { ClockIcon } from './icons/ClockIcon';
import { NewspaperIcon } from './icons/NewspaperIcon';
import { WrenchIcon } from './icons/WrenchIcon';

interface SidebarProps {
  user: Omit<User, 'password'>;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
}

interface MenuItem {
  view: AppView;
  label: string;
  // FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
  icon: React.ReactElement;
  roles: ('Admin' | 'Operator')[];
  group: 'main' | 'admin' | 'operator';
}

const menuItems: MenuItem[] = [
  // Shared
  { view: 'dashboard', label: 'Dashboard', icon: <DashboardIcon className="h-5 w-5" />, roles: ['Admin', 'Operator'], group: 'main' },
  { view: 'troubleshooting-tool', label: 'AI Command Center', icon: <WrenchIcon className="h-5 w-5" />, roles: ['Admin', 'Operator'], group: 'main' },
  
  // Admin
  { view: 'megajet-settings', label: 'Megajet Settings', icon: <SettingsIcon className="h-5 w-5" />, roles: ['Admin'], group: 'admin' },
  { view: 'scenario-creator', label: 'Scenario Creator', icon: <ClipboardIcon className="h-5 w-5" />, roles: ['Admin'], group: 'admin' },
  { view: 'employee-management', label: 'Employee Management', icon: <UsersIcon className="h-5 w-5" />, roles: ['Admin'], group: 'admin' },
  
  // Operator (Now also visible to Admins)
  { view: 'break-tracker', label: 'Break Tracker', icon: <ClockIcon className="h-5 w-5" />, roles: ['Admin', 'Operator'], group: 'operator' },
  { view: 'scenario-newsfeed', label: 'Scenario Newsfeed', icon: <NewspaperIcon className="h-5 w-5" />, roles: ['Admin', 'Operator'], group: 'operator' },
];

const Sidebar: React.FC<SidebarProps> = ({ user, activeView, setActiveView }) => {
  const [isAdminMenuOpen, setAdminMenuOpen] = useState(true);
  const [isOperatorMenuОpen, setOperatorMenuOpen] = useState(true);

  const renderMenuItem = (item: MenuItem) => {
    if (!item.roles.includes(user.role)) return null;

    const isActive = activeView === item.view;
    const itemClass = `flex items-center w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-blue text-white'
        : 'text-gray-300 hover:bg-dark-input hover:text-white'
    }`;

    return (
      <li key={item.view}>
        <button onClick={() => setActiveView(item.view)} className={itemClass}>
          {item.icon}
          <span className="ml-3">{item.label}</span>
        </button>
      </li>
    );
  };

  const renderMenuGroup = (title: string, group: 'admin' | 'operator', isOpen: boolean, setIsOpen: (isOpen: boolean) => void) => {
      const items = menuItems.filter(item => item.group === group && item.roles.includes(user.role));
      if (items.length === 0) return null;

      return (
          <div>
              <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full px-1 py-2 text-sm font-semibold text-gray-400 hover:text-white">
                  <span>{title}</span>
                  <svg className={`h-5 w-5 transform transition-transform ${isOpen ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
              </button>
              {isOpen && <ul className="space-y-1 mt-1">{items.map(renderMenuItem)}</ul>}
          </div>
      );
  }

  return (
    <aside className="w-64 bg-dark-card border-r border-dark-border flex-col p-4 hidden md:flex">
      <div className="flex-shrink-0">
          <div className="flex items-center space-x-2 mb-6">
               <img src="/vite.svg" alt="PecoFoods Logo" className="h-8 w-8" />
              <span className="font-bold text-white text-lg">Command Center</span>
          </div>
      </div>
      <nav className="flex-1 space-y-2 overflow-y-auto">
        <ul className="space-y-1">
            {menuItems.filter(item => item.group === 'main').map(renderMenuItem)}
        </ul>
        <hr className="border-t border-dark-border my-4" />
        {user.role === 'Admin' && (
          <>
            {renderMenuGroup('Admin Menus', 'admin', isAdminMenuOpen, setAdminMenuOpen)}
            {renderMenuGroup('Operator Menus', 'operator', isOperatorMenuОpen, setOperatorMenuOpen)}
          </>
        )}
        {user.role === 'Operator' && renderMenuGroup('Operator Menus', 'operator', isOperatorMenuОpen, setOperatorMenuOpen)}
      </nav>
    </aside>
  );
};

export default Sidebar;