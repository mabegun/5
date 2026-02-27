'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Briefcase, ChevronRight } from 'lucide-react'
import type { Project, User } from '@/types'
import { getStatusBadge } from '@/lib/utils'

interface DashboardProps {
  user: User | null
  projects: Project[]
  users: User[]
  onNewProject: () => void
  onSelectProject: (project: Project) => void
}

export function Dashboard({ user, projects, users, onNewProject, onSelectProject }: DashboardProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Добро пожаловать, {user?.name}!</h1>
      
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Последние проекты</CardTitle>
          <Button size="sm" onClick={onNewProject}>
            <Plus className="h-4 w-4 mr-1" /> Новый проект
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {projects.slice(0, 5).map(project => (
              <div
                key={project.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer"
                onClick={() => onSelectProject(project)}
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
}
