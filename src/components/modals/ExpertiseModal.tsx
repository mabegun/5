'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SimpleModal } from './SimpleModal'
import { Plus, X } from 'lucide-react'

interface Expert {
  name: string
  phone?: string
  email?: string
  organization?: string
}

interface Expertise {
  id: string
  stageName?: string
  experts?: Expert[]
  startDate?: string
  endDate?: string
}

interface ExpertiseStage {
  id: string
  name: string
}

interface ExpertiseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  onDelete?: () => void
  expertise?: Expertise | null
  expertiseStages: ExpertiseStage[]
}

export function ExpertiseModal({
  open,
  onOpenChange,
  onSubmit,
  onDelete,
  expertise,
  expertiseStages
}: ExpertiseModalProps) {
  const [stageName, setStageName] = useState(expertise?.stageName || '')
  const [experts, setExperts] = useState<Expert[]>(expertise?.experts || [{ name: '', phone: '', email: '', organization: '' }])
  const [startDate, setStartDate] = useState(expertise?.startDate || '')
  const [endDate, setEndDate] = useState(expertise?.endDate || '')

  const addExpert = () => {
    setExperts([...experts, { name: '', phone: '', email: '', organization: '' }])
  }

  const removeExpert = (index: number) => {
    setExperts(experts.filter((_, i) => i !== index))
  }

  const updateExpert = (index: number, field: keyof Expert, value: string) => {
    setExperts(experts.map((e, i) => i === index ? { ...e, [field]: value } : e))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      stageName,
      experts: experts.filter(e => e.name.trim()),
      startDate,
      endDate
    })
  }

  return (
    <SimpleModal
      open={open}
      onClose={() => onOpenChange(false)}
      title={expertise ? 'Редактировать экспертизу' : 'Добавить экспертизу'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="space-y-2">
          <Label>Этап экспертизы</Label>
          <select
            value={stageName}
            onChange={e => setStageName(e.target.value)}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">-- Выберите этап --</option>
            {expertiseStages.map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
            <option value="custom">Другой (ввести вручную)</option>
          </select>
        </div>

        {stageName === 'custom' && (
          <div className="space-y-2">
            <Label>Название этапа</Label>
            <Input
              value=""
              onChange={e => setStageName(e.target.value)}
              placeholder="Название этапа"
            />
          </div>
        )}

        <hr className="my-4" />
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">Эксперты</h4>
          <Button type="button" variant="outline" size="sm" onClick={addExpert}>
            <Plus className="h-4 w-4 mr-1" />
            Добавить эксперта
          </Button>
        </div>

        {experts.map((expert, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3 relative">
            {experts.length > 1 && (
              <button
                type="button"
                onClick={() => removeExpert(index)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">ФИО *</Label>
                <Input
                  value={expert.name}
                  onChange={e => updateExpert(index, 'name', e.target.value)}
                  placeholder="Иванов И.И."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Организация</Label>
                <Input
                  value={expert.organization || ''}
                  onChange={e => updateExpert(index, 'organization', e.target.value)}
                  placeholder="ГУП Экспертиза"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Телефон</Label>
                <Input
                  value={expert.phone || ''}
                  onChange={e => updateExpert(index, 'phone', e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Email</Label>
                <Input
                  type="email"
                  value={expert.email || ''}
                  onChange={e => updateExpert(index, 'email', e.target.value)}
                  placeholder="mail@example.com"
                />
              </div>
            </div>
          </div>
        ))}

        <hr className="my-4" />
        <h4 className="font-medium text-sm">Сроки</h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Дата начала</Label>
            <Input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Дата окончания</Label>
            <Input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-between gap-2 pt-4">
          <div>
            {expertise && onDelete && (
              <Button type="button" variant="destructive" onClick={onDelete}>
                Удалить
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={!stageName}>
              {expertise ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </div>
      </form>
    </SimpleModal>
  )
}
