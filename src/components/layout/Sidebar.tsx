'use client'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Building2, Users, FolderOpen, Settings, LogOut, Home } from 'lucide-react'
import type { User } from '@/types'
import { getInitials } from '@/lib/api'

interface SidebarProps {
  user: User | null
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
}

export function Sidebar({ user, activeTab, onTabChange, onLogout }: SidebarProps) {
  return (
    <div className="w-64 bg-card border-r flex flex-col">
      <div className="p-4 border-b flex items-center gap-3">
        <Building2 className="h-8 w-8 text-primary" />
        <span className="font-bold text-lg">Проектное Бюро</span>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        <Button
          variant={activeTab === 'dashboard' ? 'secondary' : 'ghost'}
          className="w-full justify-start gap-3"
          onClick={() => onTabChange('dashboard')}
        >
          <Home className="h-5 w-5" /> Главная
        </Button>
        <Button
          variant={activeTab === 'projects' ? 'secondary' : 'ghost'}
          className="w-full justify-start gap-3"
          onClick={() => onTabChange('projects')}
        >
          <FolderOpen className="h-5 w-5" /> Проекты
        </Button>
        {user?.role === 'admin' && (
          <Button
            variant={activeTab === 'users' ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-3"
            onClick={() => onTabChange('users')}
          >
            <Users className="h-5 w-5" /> Сотрудники
          </Button>
        )}
        <Button
          variant={activeTab === 'settings' ? 'secondary' : 'ghost'}
          className="w-full justify-start gap-3"
          onClick={() => onTabChange('settings')}
        >
          <Settings className="h-5 w-5" /> Настройки
        </Button>
      </nav>
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <Avatar style={{ backgroundColor: user?.avatarColor || '#3B82F6' }}>
            <AvatarFallback className="text-white">
              {user?.name ? getInitials(user.name) : '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full mt-2 justify-start gap-2" onClick={onLogout}>
          <LogOut className="h-4 w-4" /> Выйти
        </Button>
      </div>
    </div>
  )
}
