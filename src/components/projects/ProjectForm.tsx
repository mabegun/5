'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DialogFooter } from '@/components/ui/dialog'
import type { Project, User } from '@/types'

interface ProjectFormProps {
  project?: Project | null
  users: User[]
  onSubmit: (data: {
    name: string
    code: string
    address: string
    deadline: string
    gipId: string
    type: string
    expertise: string
  }) => void
  onCancel: () => void
}

export function ProjectForm({ project, users, onSubmit, onCancel }: ProjectFormProps) {
  const [form, setForm] = useState({
    name: project?.name || '',
    code: project?.code || '',
    address: project?.address || '',
    deadline: project?.deadline || '',
    gipId: project?.gip?.id || '',
    type: project?.type || 'construction',
    expertise: project?.expertise || 'none'
  })

  useEffect(() => {
    if (project) {
      setForm({
        name: project.name,
        code: project.code || '',
        address: project.address || '',
        deadline: project.deadline || '',
        gipId: project.gip?.id || '',
        type: project.type || 'construction',
        expertise: project.expertise || 'none'
      })
    }
  }, [project])

  const handleSubmit = () => {
    if (!form.name.trim()) {
      alert('Введите название проекта')
      return
    }
    onSubmit(form)
  }

  return (
    <div className="space-y-4">
      <div className="col-span-2">
        <Label>Название *</Label>
        <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Название проекта" required />
      </div>
      <div>
        <Label>Шифр</Label>
        <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="1234-АБ" />
      </div>
      <div>
        <Label>Тип</Label>
        <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="construction">Новое строительство</SelectItem>
            <SelectItem value="reconstruction">Реконструкция</SelectItem>
            <SelectItem value="design">Проектирование</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2">
        <Label>Адрес</Label>
        <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Адрес объекта" />
      </div>
      <div>
        <Label>Срок</Label>
        <Input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
      </div>
      <div>
        <Label>ГИП</Label>
        <Select value={form.gipId} onValueChange={v => setForm({ ...form, gipId: v })}>
          <SelectTrigger><SelectValue placeholder="Выберите ГИП" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Не назначен</SelectItem>
            {users.filter(u => u.role === 'gip' || u.role === 'admin').map(u => (
              <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2">
        <Label>Экспертиза</Label>
        <Select value={form.expertise} onValueChange={v => setForm({ ...form, expertise: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Без экспертизы</SelectItem>
            <SelectItem value="state">Гос. экспертиза</SelectItem>
            <SelectItem value="non_state">Негос. экспертиза</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Отмена</Button>
        <Button onClick={handleSubmit}>{project ? 'Сохранить' : 'Создать'}</Button>
      </DialogFooter>
    </div>
  )
}
