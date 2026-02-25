'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Building2, Users, FolderOpen, Settings, LogOut, Plus, Search, 
  ChevronRight, Calendar, MapPin, User, FileText, CheckCircle2, 
  Clock, AlertCircle, Upload, X, Menu, Home, Briefcase
} from 'lucide-react'

// Types
interface User {
  id: string
  email: string
  name: string
  role: string
  position?: string
  avatar?: string
  avatarColor?: string
}

interface Project {
  id: string
  name: string
  code?: string
  address?: string
  status: string
  deadline?: string
  progress: number
  sectionsTotal: number
  sectionsCompleted: number
  gip?: User
}

interface Section {
  id: string
  code: string
  description?: string
  status: string
  assignee?: User
  files?: any[]
  completedFile?: string
}

interface Investigation {
  id: string
  name: string
  status: string
  contractorName?: string
}

// API helper
const api = async (url: string, options: RequestInit = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  })
  return res.json()
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  // Modals
  const [showLoginModal, setShowLoginModal] = useState(true)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  
  // Forms
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [projectForm, setProjectForm] = useState({ 
    name: '', code: '', address: '', deadline: '', gipId: '' 
  })
  const [userForm, setUserForm] = useState({
    email: '', password: '', name: '', position: '', role: 'employee'
  })

  // Check auth on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const data = await api('/api/auth/me')
      if (data.success && data.user) {
        setUser(data.user)
        setShowLoginModal(false)
        loadData()
      }
    } catch {
      // Not authenticated
    }
    setLoading(false)
  }

  const loadData = async () => {
    loadProjects()
    if (user?.role === 'admin') {
      loadUsers()
    }
  }

  const loadProjects = async () => {
    const data = await api('/api/projects')
    if (data.success) {
      setProjects(data.projects)
    }
  }

  const loadUsers = async () => {
    const data = await api('/api/users')
    if (data.success) {
      setUsers(data.users)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginForm)
    })
    if (data.success) {
      setUser(data.user)
      setShowLoginModal(false)
      setLoginForm({ email: '', password: '' })
      loadData()
    } else {
      alert(data.error || 'Ошибка входа')
    }
  }

  const handleLogout = async () => {
    await api('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setShowLoginModal(true)
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = await api('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectForm)
    })
    if (data.success) {
      setShowProjectModal(false)
      setProjectForm({ name: '', code: '', address: '', deadline: '', gipId: '' })
      loadProjects()
    } else {
      alert(data.error || 'Ошибка создания')
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = await api('/api/users', {
      method: 'POST',
      body: JSON.stringify(userForm)
    })
    if (data.success) {
      setShowUserModal(false)
      setUserForm({ email: '', password: '', name: '', position: '', role: 'employee' })
      loadUsers()
    } else {
      alert(data.error || 'Ошибка создания')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      not_started: 'bg-gray-100 text-gray-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      in_work: 'bg-blue-100 text-blue-700',
      archived: 'bg-gray-200 text-gray-500',
    }
    const labels: Record<string, string> = {
      not_started: 'Не начат',
      in_progress: 'В работе',
      completed: 'Завершён',
      in_work: 'В работе',
      archived: 'В архиве',
    }
    return <Badge className={styles[status] || styles.not_started}>{labels[status] || status}</Badge>
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.code?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Login Modal
  const LoginModal = () => (
    <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Проектное Бюро</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={loginForm.email}
              onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
              placeholder="email@example.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={loginForm.password}
              onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="w-full">Войти</Button>
        </form>
        <p className="text-sm text-muted-foreground text-center">
          Демо: admin@test.com / admin123
        </p>
      </DialogContent>
    </Dialog>
  )

  // Sidebar
  const Sidebar = () => (
    <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-card border-r transition-all duration-300 flex flex-col`}>
      <div className="p-4 border-b flex items-center gap-3">
        <Building2 className="h-8 w-8 text-primary" />
        {sidebarOpen && <span className="font-bold text-lg">Проектное Бюро</span>}
      </div>
      
      <nav className="flex-1 p-2 space-y-1">
        <Button
          variant={activeTab === 'dashboard' ? 'secondary' : 'ghost'}
          className="w-full justify-start gap-3"
          onClick={() => setActiveTab('dashboard')}
        >
          <Home className="h-5 w-5" />
          {sidebarOpen && 'Главная'}
        </Button>
        <Button
          variant={activeTab === 'projects' ? 'secondary' : 'ghost'}
          className="w-full justify-start gap-3"
          onClick={() => setActiveTab('projects')}
        >
          <FolderOpen className="h-5 w-5" />
          {sidebarOpen && 'Проекты'}
        </Button>
        {user?.role === 'admin' && (
          <Button
            variant={activeTab === 'users' ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-3"
            onClick={() => setActiveTab('users')}
          >
            <Users className="h-5 w-5" />
            {sidebarOpen && 'Сотрудники'}
          </Button>
        )}
        <Button
          variant={activeTab === 'settings' ? 'secondary' : 'ghost'}
          className="w-full justify-start gap-3"
          onClick={() => setActiveTab('settings')}
        >
          <Settings className="h-5 w-5" />
          {sidebarOpen && 'Настройки'}
        </Button>
      </nav>
      
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <Avatar style={{ backgroundColor: user?.avatarColor || '#3B82F6' }}>
            <AvatarFallback className="text-white">
              {user?.name ? getInitials(user.name) : '?'}
            </AvatarFallback>
          </Avatar>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
        </div>
        <Button variant="ghost" size="sm" className="w-full mt-2 justify-start gap-2" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          {sidebarOpen && 'Выйти'}
        </Button>
      </div>
    </div>
  )

  // Dashboard
  const Dashboard = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Добро пожаловать, {user?.name}!</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Всего проектов</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{projects.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">В работе</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {projects.filter(p => p.status === 'in_work').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Завершено</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {projects.filter(p => p.status === 'completed').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Сотрудников</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{users.length || '-'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Последние проекты</CardTitle>
          <Button size="sm" onClick={() => setShowProjectModal(true)}>
            <Plus className="h-4 w-4 mr-1" /> Новый проект
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {projects.slice(0, 5).map(project => (
              <div
                key={project.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer"
                onClick={() => {
                  setSelectedProject(project)
                  setActiveTab('projects')
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {project.code && <span className="mr-2">{project.code}</span>}
                      {project.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(project.status)}
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Нет проектов. Создайте первый!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Projects List
  const ProjectsList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Проекты</h1>
        <Button onClick={() => setShowProjectModal(true)}>
          <Plus className="h-4 w-4 mr-2" /> Новый проект
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Поиск по названию или шифру..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map(project => (
          <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedProject(project)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  {project.code && (
                    <p className="text-sm text-muted-foreground">{project.code}</p>
                  )}
                </div>
                {getStatusBadge(project.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.address && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {project.address}
                </div>
              )}
              {project.deadline && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Срок: {new Date(project.deadline).toLocaleDateString('ru-RU')}
                </div>
              )}
              {project.gip && (
                <div className="flex items-center gap-2 text-sm">
                  <Avatar className="h-6 w-6" style={{ backgroundColor: project.gip.avatarColor || '#3B82F6' }}>
                    <AvatarFallback className="text-xs text-white">
                      {getInitials(project.gip.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span>ГИП: {project.gip.name}</span>
                </div>
              )}
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Прогресс</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} />
                <p className="text-xs text-muted-foreground">
                  {project.sectionsCompleted} из {project.sectionsTotal} разделов завершено
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? 'Проекты не найдены' : 'Нет проектов'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  // Users List
  const UsersList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Сотрудники</h1>
        <Button onClick={() => setShowUserModal(true)}>
          <Plus className="h-4 w-4 mr-2" /> Добавить сотрудника
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-4 hover:bg-accent">
                <div className="flex items-center gap-3">
                  <Avatar style={{ backgroundColor: u.avatarColor || '#3B82F6' }}>
                    <AvatarFallback className="text-white">
                      {getInitials(u.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    u.role === 'admin' ? 'default' :
                    u.role === 'gip' ? 'secondary' : 'outline'
                  }>
                    {u.role === 'admin' ? 'Администратор' :
                     u.role === 'gip' ? 'ГИП' : 'Исполнитель'}
                  </Badge>
                  {u.position && (
                    <span className="text-sm text-muted-foreground">{u.position}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Settings
  const SettingsPage = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Настройки</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Профиль</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16" style={{ backgroundColor: user?.avatarColor || '#3B82F6' }}>
              <AvatarFallback className="text-xl text-white">
                {user?.name ? getInitials(user.name) : '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-lg">{user?.name}</p>
              <p className="text-muted-foreground">{user?.email}</p>
              <p className="text-sm text-muted-foreground">{user?.position}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Create Project Modal
  const ProjectModal = () => (
    <Dialog open={showProjectModal} onOpenChange={setShowProjectModal}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Новый проект</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <Label htmlFor="projectName">Название проекта *</Label>
            <Input
              id="projectName"
              value={projectForm.name}
              onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="projectCode">Шифр</Label>
              <Input
                id="projectCode"
                value={projectForm.code}
                onChange={e => setProjectForm({ ...projectForm, code: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="projectDeadline">Срок</Label>
              <Input
                id="projectDeadline"
                type="date"
                value={projectForm.deadline}
                onChange={e => setProjectForm({ ...projectForm, deadline: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="projectAddress">Адрес</Label>
            <Input
              id="projectAddress"
              value={projectForm.address}
              onChange={e => setProjectForm({ ...projectForm, address: e.target.value })}
            />
          </div>
          {user?.role === 'admin' && users.length > 0 && (
            <div>
              <Label htmlFor="projectGip">ГИП</Label>
              <Select value={projectForm.gipId} onValueChange={v => setProjectForm({ ...projectForm, gipId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите ГИПа" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.role === 'gip' || u.role === 'admin').map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowProjectModal(false)}>
              Отмена
            </Button>
            <Button type="submit">Создать</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )

  // Create User Modal
  const UserModal = () => (
    <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Новый сотрудник</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="userName">Имя *</Label>
              <Input
                id="userName"
                value={userForm.name}
                onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="userEmail">Email *</Label>
              <Input
                id="userEmail"
                type="email"
                value={userForm.email}
                onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="userPassword">Пароль *</Label>
              <Input
                id="userPassword"
                type="password"
                value={userForm.password}
                onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="userRole">Роль</Label>
              <Select value={userForm.role} onValueChange={v => setUserForm({ ...userForm, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Исполнитель</SelectItem>
                  <SelectItem value="gip">ГИП</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="userPosition">Должность</Label>
            <Input
              id="userPosition"
              value={userForm.position}
              onChange={e => setUserForm({ ...userForm, position: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowUserModal(false)}>
              Отмена
            </Button>
            <Button type="submit">Создать</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 border-b bg-card flex items-center px-4 gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
        </header>
        
        {/* Content */}
        <div className="flex-1 p-6 overflow-auto bg-muted/30">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'projects' && <ProjectsList />}
          {activeTab === 'users' && user?.role === 'admin' && <UsersList />}
          {activeTab === 'settings' && <SettingsPage />}
        </div>
      </main>

      <LoginModal />
      <ProjectModal />
      <UserModal />
    </div>
  )
}
