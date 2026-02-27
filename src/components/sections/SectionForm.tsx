'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DialogFooter } from '@/components/ui/dialog'
import { Section, User, StandardSection } from '@/types'

interface SectionFormProps {
  section?: Section | null
  standardSections: StandardSection[]
  users: User[]
  onSubmit: (data: { code: string; description: string; assigneeId: string; coAssignees: string[]; status: string }) => void
  onCancel: () => void
  onDelete?: () => void
}

export function SectionForm({ section, standardSections, users, onSubmit, onCancel, onDelete }: SectionFormProps) {
  const [code, setCode] = useState(section?.code || '')
  const [description, setDescription] = useState(section?.description || '')
  const [assigneeId, setAssigneeId] = useState(section?.assigneeId || '')
  const [coAssignees, setCoAssignees] = useState<string[]>(section?.coAssignees || [])
  const [status, setStatus] = useState(section?.status || 'not_started')

  return (
    <div className="space-y-4">
      <div>
        <Label>Шифр раздела *</Label>
        <Select value={code} onValueChange={setCode}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите раздел" />
          </SelectTrigger>
          <SelectContent>
            {standardSections.map(s => (
              <SelectItem key={s.id} value={s.code}>{s.code} - {s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Описание</Label>
        <Textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Описание раздела"
          rows={3}
        />
      </div>

      <div>
        <Label>Исполнитель</Label>
        <Select value={assigneeId} onValueChange={setAssigneeId}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите исполнителя" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Не назначен</SelectItem>
            {users.map(u => (
              <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Соисполнители</Label>
        <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
          {users.filter(u => u.id !== assigneeId).map(u => (
            <label key={u.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={coAssignees.includes(u.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setCoAssignees([...coAssignees, u.id])
                  } else {
                    setCoAssignees(coAssignees.filter(id => id !== u.id))
                  }
                }}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{u.name}</span>
            </label>
          ))}
          {users.filter(u => u.id !== assigneeId).length === 0 && (
            <p className="text-sm text-muted-foreground">Нет доступных сотрудников</p>
          )}
        </div>
        {coAssignees.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {coAssignees.map(id => {
              const user = users.find(u => u.id === id)
              return user ? (
                <Badge key={id} variant="secondary" className="cursor-pointer" onClick={() => setCoAssignees(coAssignees.filter(cid => cid !== id))}>
                  {user.name} ×
                </Badge>
              ) : null
            })}
          </div>
        )}
      </div>

      <div>
        <Label>Статус</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="not_started">Не начат</SelectItem>
            <SelectItem value="in_progress">В работе</SelectItem>
            <SelectItem value="completed">Завершён</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter className="flex justify-between">
        <div>
          {onDelete && (
            <Button variant="destructive" onClick={onDelete}>Удалить</Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Отмена</Button>
          <Button onClick={() => onSubmit({ code, description, assigneeId, coAssignees, status })}>
            {section ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </DialogFooter>
    </div>
  )
}
