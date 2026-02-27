'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DialogFooter } from '@/components/ui/dialog'
import type { User } from '@/types'

interface UserFormProps {
  user?: User | null
  currentUserId?: string
  onSubmit: (data: { name: string; email: string; password: string; position: string; role: string }) => Promise<{ success: boolean; error?: string }>
  onDelete?: () => void
  onCancel: () => void
}

export function UserForm({ user, currentUserId, onSubmit, onDelete, onCancel }: UserFormProps) {
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [position, setPosition] = useState(user?.position || '')
  const [role, setRole] = useState(user?.role || 'employee')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setPosition(user.position || '')
      setRole(user.role)
    } else {
      setName('')
      setEmail('')
      setPosition('')
      setRole('employee')
    }
    setPassword('')
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const result = await onSubmit({ name, email, password, position, role })
    
    setLoading(false)
    if (!result.success) {
      setError(result.error || 'Ошибка сохранения')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>ФИО *</Label>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Иванов Иван Иванович"
          required
        />
      </div>
      
      <div>
        <Label>Email *</Label>
        <Input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="email@example.com"
          required
          disabled={!!user}
        />
        {user && <p className="text-xs text-muted-foreground mt-1">Email нельзя изменить</p>}
      </div>
      
      <div>
        <Label>Пароль {user ? '(оставьте пустым, чтобы не менять)' : '*'}</Label>
        <Input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          required={!user}
        />
      </div>
      
      <div>
        <Label>Должность</Label>
        <Input
          value={position}
          onChange={e => setPosition(e.target.value)}
          placeholder="Инженер"
        />
      </div>
      
      <div>
        <Label>Роль</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="employee">Сотрудник</SelectItem>
            <SelectItem value="gip">ГИП</SelectItem>
            <SelectItem value="admin">Администратор</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <DialogFooter className="flex justify-between">
        <div>
          {user && user.id !== currentUserId && onDelete && (
            <Button type="button" variant="destructive" onClick={onDelete}>
              Удалить
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Сохранение...' : user ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </DialogFooter>
    </form>
  )
}
