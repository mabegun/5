 'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DialogFooter } from '@/components/ui/dialog'
import type { User } from '@/types'

interface ContactFormProps {
  contact?: { name: string; position: string; company: string; phone: string; email: string; notes: string } | null
  onSubmit: (data: { name: string; position: string; company: string; phone: string; email: string; notes: string }) => void
  onCancel: () => void
}

export function ContactForm({ contact, onSubmit, onCancel }: ContactFormProps) {
  const [form, setForm] = useState({
    name: contact?.name || '',
    position: contact?.position || '',
    company: contact?.company || '',
    phone: contact?.phone || '',
    email: contact?.email || '',
    notes: contact?.notes || ''
  })

  const handleSubmit = () => {
    if (!form.name.trim()) {
      alert('Введите ФИО')
      return
    }
    onSubmit(form)
  }

  return (
    <div className="space-y-4">
      <div><Label>ФИО *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Иванов Иван Иванович" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Должность</Label><Input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} placeholder="Директор" /></div>
        <div><Label>Организация</Label><Input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="ООО 'Компания'" /></div>
        <div><Label>Телефон</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+7 (999) 123-45-67" /></div>
        <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" /></div>
      </div>
      <div><Label>Примечание</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Дополнительная информация" /></div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Отмена</Button>
        <Button onClick={handleSubmit}>Создать</Button>
      </DialogFooter>
    </div>
  )
}
