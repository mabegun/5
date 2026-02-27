'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SimpleModal } from './SimpleModal'

interface Section {
  id: string
  code: string
  description?: string
  status: string
  assigneeId?: string
  coAssignees?: string[]
}

interface StandardSection {
  id: string
  code: string
  name: string
}

interface SectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { code: string; description: string; assigneeId: string; coAssignees: string[]; status: string }) => void
  onDelete?: () => void
  section?: Section | null
  users: { id: string; name: string }[]
  standardSections: StandardSection[]
}

export function SectionModal({
  open,
  onOpenChange,
  onSubmit,
  onDelete,
  section,
  users,
  standardSections
}: SectionModalProps) {
  const [code, setCode] = useState(section?.code || '')
  const [description, setDescription] = useState(section?.description || '')
  const [assigneeId, setAssigneeId] = useState(section?.assigneeId || '')
  const [coAssignees, setCoAssignees] = useState<string[]>(section?.coAssignees || [])
  const [status, setStatus] = useState(section?.status || 'not_started')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ code, description, assigneeId, coAssignees, status })
  }

  // При выборе стандартного раздела заполняем данные
  const handleStandardSelect = (standardId: string) => {
    const standard = standardSections.find(s => s.id === standardId)
    if (standard) {
      setCode(standard.code)
      setDescription(standard.name)
    }
  }

  // Переключение соисполнителя
  const toggleCoAssignee = (userId: string) => {
    setCoAssignees(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const statusLabels: Record<string, string> = {
    not_started: 'Не начат',
    in_progress: 'В работе',
    completed: 'Завершён'
  }

  return (
    <SimpleModal
      open={open}
      onClose={() => onOpenChange(false)}
      title={section ? 'Редактировать раздел' : 'Добавить раздел'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Выбор из стандартных разделов */}
        <div className="space-y-2">
          <Label>Выбрать из списка</Label>
          <select
            onChange={(e) => handleStandardSelect(e.target.value)}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            value=""
          >
            <option value="">-- Выберите стандартный раздел --</option>
            {standardSections.map(s => (
              <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
            ))}
          </select>
        </div>

        <div className="text-center text-gray-400 text-sm">— или введите вручную —</div>

        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Шифр *</Label>
            <Input
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="ГП"
              required
            />
          </div>
          <div className="col-span-3 space-y-2">
            <Label>Название *</Label>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Генеральный план"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Исполнитель</Label>
          <select
            value={assigneeId}
            onChange={e => setAssigneeId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Не назначен</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Соисполнители</Label>
          <div className="border rounded-lg p-3 max-h-32 overflow-y-auto">
            {users.filter(u => u.id !== assigneeId).map(u => (
              <label key={u.id} className="flex items-center gap-2 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={coAssignees.includes(u.id)}
                  onChange={() => toggleCoAssignee(u.id)}
                  className="rounded"
                />
                <span className="text-sm">{u.name}</span>
              </label>
            ))}
            {users.length <= 1 && (
              <p className="text-sm text-muted-foreground">Нет доступных сотрудников</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Статус</Label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-between gap-2 pt-4">
          <div>
            {section && onDelete && (
              <Button type="button" variant="destructive" onClick={onDelete}>
                Удалить
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={!code.trim() || !description.trim()}>
              {section ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </div>
      </form>
    </SimpleModal>
  )
}
