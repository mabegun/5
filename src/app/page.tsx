'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Search, ChevronRight, MapPin, Calendar, Plus, Trash2, ArrowLeft,
  FileText, CheckCircle2, Paperclip, User, ClipboardList
} from 'lucide-react'

// Import modular components
import { LoginModal } from '@/components/modals/LoginModal'
import { Sidebar } from '@/components/layout/Sidebar'
import { Dashboard } from '@/components/pages/Dashboard'
import { SectionDetailPage } from '@/components/sections/SectionDetailPage'
import { SectionForm } from '@/components/sections/SectionForm'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { UserForm } from '@/components/users/UserForm'
import { ContactForm } from '@/components/contacts/ContactForm'
import { ExpertiseDetailPage } from '@/components/expertise/ExpertiseDetailPage'
import { InvestigationDetail } from '@/components/investigations/InvestigationDetail'
import { InvestigationForm } from '@/components/investigations/InvestigationForm'

// Import types
import type {
  User as UserType, Project, Section, Investigation, Expertise,
  StandardSection, StandardInvestigation, Contact
} from '@/types'

// Import utilities
import { api, getInitials } from '@/lib/api'
import { getStatusBadge, getExpertiseBadge } from '@/lib/utils'

const VERSION = 'v1.11.2'

export default function ProjectBureauApp() {
  // Auth & Global State
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Detail views
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [selectedInvestigation, setSelectedInvestigation] = useState<Investigation | null>(null)
  const [selectedExpertise, setSelectedExpertise] = useState<Expertise | null>(null)

  // Modals
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showSectionModal, setShowSectionModal] = useState(false)
  const [showInvestigationModal, setShowInvestigationModal] = useState(false)
  const [showExpertiseModal, setShowExpertiseModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showRemarkModal, setShowRemarkModal] = useState(false)

  // Editing
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)
  const [editingSection, setEditingSection] = useState<Section | null>(null)

  // Data
  const [sections, setSections] = useState<Section[]>([])
  const [investigations, setInvestigations] = useState<Investigation[]>([])
  const [expertises, setExpertises] = useState<Expertise[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [standardSections, setStandardSections] = useState<StandardSection[]>([])
  const [standardInvestigations, setStandardInvestigations] = useState<StandardInvestigation[]>([])

  // Form states
  const [newRemarkForm, setNewRemarkForm] = useState({ content: '', sectionId: '', number: '' })
  const [expertiseForm, setExpertiseForm] = useState({ stageName: '' })
  const remarkFileRef = useRef<HTMLInputElement>(null)

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await api('/api/auth/me')
        if (data.success && data.user) {
          setUser(data.user)
          loadData()
        }
      } catch { }
      setLoading(false)
    }
    checkAuth()
  }, [])

  const loadData = () => {
    loadProjects()
    loadUsers()
    loadStandardSections()
    loadStandardInvestigations()
  }

  const loadProjects = async () => {
    const data = await api('/api/projects')
    if (data.success) setProjects(data.projects)
  }

  const loadUsers = async () => {
    const data = await api('/api/users')
    if (data.success) setUsers(data.users)
  }

  const loadStandardSections = async () => {
    const data = await api('/api/standard-sections')
    if (data.success) setStandardSections(data.sections)
  }

  const loadStandardInvestigations = async () => {
    const data = await api('/api/standard-investigations')
    if (data.success) setStandardInvestigations(data.investigations)
  }

  const loadProjectSections = async (projectId: string) => {
    const data = await api(`/api/projects/${projectId}`)
    if (data.success && data.project) setSections(data.project.sections || [])
  }

  const loadProjectInvestigations = async (projectId: string) => {
    const data = await api(`/api/investigations?projectId=${projectId}`)
    if (data.success) setInvestigations(data.investigations || [])
  }

  const loadProjectExpertises = async (projectId: string) => {
    const data = await api(`/api/expertises?projectId=${projectId}`)
    if (data.success) setExpertises(data.expertises || [])
  }

  const loadProjectContacts = async (projectId: string) => {
    const data = await api(`/api/contacts?projectId=${projectId}`)
    if (data.success) setContacts(data.contacts || [])
  }

  const loadExpertiseDetail = async (expertiseId: string) => {
    const data = await api(`/api/expertises/${expertiseId}`)
    if (data.success && data.expertise) setSelectedExpertise(data.expertise)
  }

  // Handlers
  const handleLogin = async (email: string, password: string) => {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    if (data.success) {
      localStorage.setItem('token', data.token)
      setUser(data.user)
      loadData()
      return { success: true }
    }
    return { success: false, error: data.error }
  }

  const handleLogout = async () => {
    await api('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('token')
    setUser(null)
    setSelectedProject(null)
    setSelectedSection(null)
  }

  const handleCreateProject = async (data: any) => {
    if (editingProject) {
      const result = await api(`/api/projects/${editingProject.id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
      if (result.success) {
        setShowProjectModal(false)
        setEditingProject(null)
        loadProjects()
        if (selectedProject) {
          const updated = await api(`/api/projects/${selectedProject.id}`)
          if (updated.success) setSelectedProject(updated.project)
        }
      } else {
        return { error: result.error }
      }
    } else {
      const result = await api('/api/projects', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (result.success) {
        setShowProjectModal(false)
        loadProjects()
      } else {
        return { error: result.error }
      }
    }
    return { success: true }
  }

  const handleCreateSection = async (data: { code: string; description: string; assigneeId: string; coAssignees: string[]; status: string }) => {
    if (!selectedProject) return { error: 'No project' }
    const response = await api('/api/sections', {
      method: 'POST',
      body: JSON.stringify({
        projectId: selectedProject.id,
        ...data,
        assigneeId: data.assigneeId || null,
        coAssignees: data.coAssignees.length > 0 ? data.coAssignees : null
      })
    })
    if (response.success) {
      setShowSectionModal(false)
      setEditingSection(null)
      loadProjectSections(selectedProject.id)
      loadProjects()
    } else {
      alert(response.error || 'Ошибка')
    }
  }

  const handleUpdateSection = async (data: { code: string; description: string; assigneeId: string; coAssignees: string[]; status: string }) => {
    if (!editingSection) return
    const response = await api(`/api/sections/${editingSection.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...data,
        assigneeId: data.assigneeId || null,
        coAssignees: data.coAssignees.length > 0 ? data.coAssignees : null
      })
    })
    if (response.success) {
      setShowSectionModal(false)
      setEditingSection(null)
      setSelectedSection(null)
      if (selectedProject) loadProjectSections(selectedProject.id)
      loadProjects()
    } else {
      alert(response.error || 'Ошибка')
    }
  }

  const handleDeleteSection = async () => {
    if (!editingSection || !selectedProject) return
    if (!confirm('Удалить раздел?')) return
    const response = await api(`/api/sections/${editingSection.id}`, { method: 'DELETE' })
    if (response.success) {
      setShowSectionModal(false)
      setEditingSection(null)
      setSelectedSection(null)
      loadProjectSections(selectedProject.id)
      loadProjects()
    }
  }

  const handleCreateUser = async (data: any) => {
    if (editingUser) {
      const updateData: any = { name: data.name, position: data.position, role: data.role }
      if (data.password) updateData.password = data.password
      const result = await api(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      })
      if (result.success) {
        setShowUserModal(false)
        setEditingUser(null)
        loadUsers()
      } else {
        return { error: result.error }
      }
    } else {
      const result = await api('/api/users', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (result.success) {
        setShowUserModal(false)
        loadUsers()
      } else {
        return { error: result.error }
      }
    }
    return { success: true }
  }

  const handleDeleteUser = async () => {
    if (!editingUser || !confirm('Удалить сотрудника?')) return
    const result = await api(`/api/users/${editingUser.id}`, { method: 'DELETE' })
    if (result.success) {
      setShowUserModal(false)
      setEditingUser(null)
      loadUsers()
    }
  }

  const handleCreateContact = async (data: any) => {
    if (!selectedProject) return
    const response = await api('/api/contacts', {
      method: 'POST',
      body: JSON.stringify({ projectId: selectedProject.id, ...data })
    })
    if (response.success) {
      setShowContactModal(false)
      loadProjectContacts(selectedProject.id)
    }
  }

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Удалить контакт?')) return
    const response = await api(`/api/contacts/${contactId}`, { method: 'DELETE' })
    if (response.success && selectedProject) loadProjectContacts(selectedProject.id)
  }

  const handleCreateRemark = async () => {
    if (!selectedExpertise || !newRemarkForm.content) return
    const formData = new FormData()
    formData.append('content', newRemarkForm.content)
    if (newRemarkForm.sectionId) {
      formData.append('sectionId', newRemarkForm.sectionId)
      const section = sections.find(s => s.id === newRemarkForm.sectionId)
      if (section) formData.append('sectionCode', section.code)
    }
    if (newRemarkForm.number) formData.append('number', newRemarkForm.number)
    const file = remarkFileRef.current?.files?.[0]
    if (file) formData.append('file', file)

    const token = localStorage.getItem('token')
    const res = await fetch(`/api/expertises/${selectedExpertise.id}/remarks`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData
    })
    const data = await res.json()
    if (data.success) {
      setShowRemarkModal(false)
      setNewRemarkForm({ content: '', sectionId: '', number: '' })
      loadExpertiseDetail(selectedExpertise.id)
    }
  }

  const handleAddExpert = async (expert: any) => {
    if (!selectedExpertise) return
    const currentExperts = selectedExpertise.experts || []
    await api(`/api/expertises/${selectedExpertise.id}`, {
      method: 'PUT',
      body: JSON.stringify({ experts: [...currentExperts, expert] })
    })
    loadExpertiseDetail(selectedExpertise.id)
  }

  const handleCloseRemark = async (remarkId: string) => {
    const response = await api(`/api/remarks/${remarkId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'closed' })
    })
    if (response.success && selectedExpertise) {
      loadExpertiseDetail(selectedExpertise.id)
    }
  }

  const handleCreateExpertise = async () => {
    if (!selectedProject) return
    const response = await api('/api/expertises', {
      method: 'POST',
      body: JSON.stringify({ projectId: selectedProject.id, stageName: expertiseForm.stageName })
    })
    if (response.success) {
      setShowExpertiseModal(false)
      setExpertiseForm({ stageName: '' })
      loadProjectExpertises(selectedProject.id)
    }
  }

  const handleCreateInvestigation = async (data: any) => {
    if (!selectedProject) return
    const response = await api('/api/investigations', {
      method: 'POST',
      body: JSON.stringify({ projectId: selectedProject.id, ...data })
    })
    if (response.success) {
      setShowInvestigationModal(false)
      loadProjectInvestigations(selectedProject.id)
    }
  }

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.code?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ========== RENDER COMPONENTS ==========

  // Projects List
  const ProjectsList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Проекты</h1>
        <Button onClick={() => { setEditingProject(null); setShowProjectModal(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Новый проект
        </Button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-10" placeholder="Поиск..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map(project => (
          <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setSelectedProject(project)
              loadProjectSections(project.id)
              loadProjectInvestigations(project.id)
              loadProjectExpertises(project.id)
              loadProjectContacts(project.id)
            }}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                {getStatusBadge(project.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {project.code && <p className="text-sm text-muted-foreground">{project.code}</p>}
              {project.address && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{project.address}</p>}
              <div className="space-y-1">
                <div className="flex justify-between text-sm"><span>Прогресс</span><span>{project.progress}%</span></div>
                <Progress value={project.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  // Project Detail Page
  const ProjectDetailPage = () => {
    if (!selectedProject) return null

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedProject(null)}><ArrowLeft className="h-5 w-5" /></Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{selectedProject.name}</h1>
            {selectedProject.code && <p className="text-muted-foreground">Шифр: {selectedProject.code}</p>}
          </div>
          <div className="flex gap-2">
            {getStatusBadge(selectedProject.status)}
            {getExpertiseBadge(selectedProject.expertise || 'none')}
            <Button variant="outline" size="sm" onClick={() => {
              setEditingProject(selectedProject)
              setShowProjectModal(true)
            }}>Редактировать</Button>
          </div>
        </div>

        <Tabs defaultValue="sections">
          <TabsList>
            <TabsTrigger value="sections">Разделы ({sections.length})</TabsTrigger>
            <TabsTrigger value="investigations">Изыскания ({investigations.length})</TabsTrigger>
            <TabsTrigger value="contacts">Контакты</TabsTrigger>
            <TabsTrigger value="expertise">Экспертиза ({expertises.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="sections" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Разделы проекта</h3>
              <Button onClick={() => { setEditingSection(null); setShowSectionModal(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Добавить раздел
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sections.map(section => (
                <Card key={section.id} className="aspect-square cursor-pointer hover:shadow-md flex flex-col"
                  onClick={() => setSelectedSection(section)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">{section.code}</span>
                      {getStatusBadge(section.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <p className="text-sm text-muted-foreground line-clamp-2">{section.description || 'Без описания'}</p>
                    {section.assignee && (
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar className="h-5 w-5" style={{ backgroundColor: section.assignee.avatarColor || '#3B82F6' }}>
                          <AvatarFallback className="text-xs text-white">{getInitials(section.assignee.name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs truncate">{section.assignee.name}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="investigations" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Изыскания</h3>
              <Button onClick={() => setShowInvestigationModal(true)}>
                <Plus className="h-4 w-4 mr-2" /> Добавить
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {investigations.map(inv => (
                <Card key={inv.id} className="cursor-pointer hover:shadow-md" onClick={() => setSelectedInvestigation(inv)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <FileText className="h-5 w-5 text-primary" />
                      {getStatusBadge(inv.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{inv.name || inv.customName || 'Без названия'}</p>
                    {inv.contractorName && <p className="text-xs text-muted-foreground mt-1">{inv.contractorName}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Контакты</h3>
              <Button onClick={() => setShowContactModal(true)}>
                <Plus className="h-4 w-4 mr-2" /> Добавить
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contacts.map(contact => (
                <Card key={contact.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{contact.name}</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteContact(contact.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    {contact.company && <p className="text-muted-foreground">{contact.company}</p>}
                    {contact.phone && <p>Тел: {contact.phone}</p>}
                    {contact.email && <p>Email: {contact.email}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="expertise" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Экспертиза</h3>
              <Button onClick={() => setShowExpertiseModal(true)}>
                <Plus className="h-4 w-4 mr-2" /> Добавить этап
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expertises.map(exp => (
                <Card key={exp.id} className="cursor-pointer hover:shadow-md"
                  onClick={() => { setSelectedExpertise(exp); loadExpertiseDetail(exp.id); }}>
                  <CardHeader><CardTitle className="text-base">{exp.stageName || 'Этап'}</CardTitle></CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>Экспертов: {exp.experts?.length || 0}</p>
                    <p>Замечаний: {exp.remarks?.length || 0}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // Users List
  const UsersList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Сотрудники</h1>
        <Button onClick={() => { setEditingUser(null); setShowUserModal(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Добавить
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(u => (
          <Card key={u.id} className="cursor-pointer hover:shadow-md" onClick={() => {
            setEditingUser(u)
            setShowUserModal(true)
          }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Avatar style={{ backgroundColor: u.avatarColor || '#3B82F6' }}>
                  <AvatarFallback className="text-white">{getInitials(u.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                  <p className="text-xs text-muted-foreground">{u.position || u.role}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  // Settings Page
  const SettingsPage = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Настройки</h1>
      <Card>
        <CardHeader><CardTitle>Профиль</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16" style={{ backgroundColor: user?.avatarColor || '#3B82F6' }}>
              <AvatarFallback className="text-2xl text-white">{user?.name ? getInitials(user.name) : '?'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-lg">{user?.name}</p>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Версия</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">{VERSION}</p></CardContent>
      </Card>
    </div>
  )

  // Modals
  const projectModal = (
    <Dialog open={showProjectModal} onOpenChange={setShowProjectModal}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{editingProject ? 'Редактировать проект' : 'Новый проект'}</DialogTitle></DialogHeader>
        <ProjectForm
          project={editingProject}
          users={users}
          onSubmit={handleCreateProject}
          onCancel={() => { setShowProjectModal(false); setEditingProject(null) }}
        />
      </DialogContent>
    </Dialog>
  )

  const sectionModal = (
    <Dialog open={showSectionModal} onOpenChange={setShowSectionModal}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editingSection ? 'Редактировать раздел' : 'Новый раздел'}</DialogTitle></DialogHeader>
        <SectionForm
          section={editingSection}
          standardSections={standardSections}
          users={users}
          onSubmit={editingSection ? handleUpdateSection : handleCreateSection}
          onCancel={() => { setShowSectionModal(false); setEditingSection(null) }}
          onDelete={editingSection ? handleDeleteSection : undefined}
        />
      </DialogContent>
    </Dialog>
  )

  const userModal = (
    <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editingUser ? 'Редактировать' : 'Новый сотрудник'}</DialogTitle></DialogHeader>
        <UserForm
          user={editingUser}
          currentUserId={user?.id}
          onSubmit={handleCreateUser}
          onDelete={editingUser && editingUser.id !== user?.id ? handleDeleteUser : undefined}
          onCancel={() => { setShowUserModal(false); setEditingUser(null) }}
        />
      </DialogContent>
    </Dialog>
  )

  const contactModal = (
    <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
      <DialogContent>
        <DialogHeader><DialogTitle>Новый контакт</DialogTitle></DialogHeader>
        <ContactForm onSubmit={handleCreateContact} onCancel={() => setShowContactModal(false)} />
      </DialogContent>
    </Dialog>
  )

  const investigationModal = (
    <Dialog open={showInvestigationModal} onOpenChange={setShowInvestigationModal}>
      <DialogContent>
        <DialogHeader><DialogTitle>Новое изыскание</DialogTitle></DialogHeader>
        <InvestigationForm
          standardInvestigations={standardInvestigations}
          onSubmit={handleCreateInvestigation}
          onCancel={() => setShowInvestigationModal(false)}
        />
      </DialogContent>
    </Dialog>
  )

  const expertiseModal = (
    <Dialog open={showExpertiseModal} onOpenChange={setShowExpertiseModal}>
      <DialogContent>
        <DialogHeader><DialogTitle>Новый этап экспертизы</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Название этапа</Label>
            <Input
              value={expertiseForm.stageName}
              onChange={e => setExpertiseForm({ stageName: e.target.value })}
              placeholder="Экспертиза раздела АР"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowExpertiseModal(false)}>Отмена</Button>
            <Button onClick={handleCreateExpertise}>Создать</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  const remarkModal = (
    <Dialog open={showRemarkModal} onOpenChange={setShowRemarkModal}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Новое замечание</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={newRemarkForm.content}
            onChange={e => setNewRemarkForm({ ...newRemarkForm, content: e.target.value })}
            placeholder="Текст замечания"
            rows={4}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Раздел</Label>
              <select
                className="w-full border rounded p-2"
                value={newRemarkForm.sectionId}
                onChange={e => setNewRemarkForm({ ...newRemarkForm, sectionId: e.target.value })}
              >
                <option value="">Без раздела</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.code}</option>)}
              </select>
            </div>
            <div>
              <Label>Номер</Label>
              <Input
                value={newRemarkForm.number}
                onChange={e => setNewRemarkForm({ ...newRemarkForm, number: e.target.value })}
                placeholder="№ 1"
              />
            </div>
          </div>
          <input type="file" ref={remarkFileRef} className="w-full" />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowRemarkModal(false)}>Отмена</Button>
            <Button onClick={handleCreateRemark}>Добавить</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  // Main render
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar
        user={user}
        activeTab={activeTab}
        onTabChange={(tab) => { setActiveTab(tab); setSelectedProject(null); setSelectedSection(null); }}
        onLogout={handleLogout}
      />

      <main className="flex-1 p-6 overflow-auto">
        {selectedSection ? (
          <SectionDetailPage
            section={selectedSection}
            users={users}
            onClose={() => setSelectedSection(null)}
            onEdit={(s) => { setEditingSection(s); setShowSectionModal(true); }}
            onRefresh={() => selectedProject && loadProjectSections(selectedProject.id)}
          />
        ) : selectedExpertise ? (
          <ExpertiseDetailPage
            expertise={selectedExpertise}
            sections={sections}
            onClose={() => setSelectedExpertise(null)}
            onAddExpert={handleAddExpert}
            onAddRemark={() => setShowRemarkModal(true)}
            onCloseRemark={handleCloseRemark}
          />
        ) : selectedProject ? (
          <ProjectDetailPage />
        ) : selectedInvestigation ? (
          <InvestigationDetail
            investigation={selectedInvestigation}
            onClose={() => setSelectedInvestigation(null)}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                user={user}
                projects={projects}
                users={users}
                onNewProject={() => setShowProjectModal(true)}
                onSelectProject={(p) => {
                  setSelectedProject(p)
                  loadProjectSections(p.id)
                  loadProjectInvestigations(p.id)
                  loadProjectExpertises(p.id)
                }}
              />
            )}
            {activeTab === 'projects' && <ProjectsList />}
            {activeTab === 'users' && user?.role === 'admin' && <UsersList />}
            {activeTab === 'settings' && <SettingsPage />}
          </>
        )}
      </main>

      <LoginModal
        open={!user}
        onOpenChange={() => {}}
        onLogin={handleLogin}
        version={VERSION}
      />
      {projectModal}
      {sectionModal}
      {userModal}
      {contactModal}
      {investigationModal}
      {expertiseModal}
      {remarkModal}
    </div>
  )
}
