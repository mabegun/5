'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SimpleModal } from './SimpleModal'

interface Investigation {
  id: string
  name: string
  isCustom: boolean
  status: string
  contractorName?: string
  contractorContact?: string
  contractorPhone?: string
  contractorEmail?: string
  contractNumber?: string
  contractDate?: string
  startDate?: string
  endDate?: string
  description?: string
}

interface StandardInvestigation {
  id: string
  name: string
}

interface InvestigationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  onDelete?: () => void
  investigation?: Investigation | null
  standardInvestigations: StandardInvestigation[]
}

export function InvestigationModal({
  open,
  onOpenChange,
  onSubmit,
  onDelete,
  investigation,
  standardInvestigations
}: InvestigationModalProps) {
  const [name, setName] = useState(investigation?.name || '')
  const [isCustom, setIsCustom] = useState(investigation?.isCustom || false)
  const [status, setStatus] = useState(investigation?.status || 'not_started')
  const [contractorName, setContractorName] = useState(investigation?.contractorName || '')
  const [contractorContact, setContractorContact] = useState(investigation?.contractorContact || '')
  const [contractorPhone, setContractorPhone] = useState(investigation?.contractorPhone || '')
  const [contractorEmail, setContractorEmail] = useState(investigation?.contractorEmail || '')
  const [contractNumber, setContractNumber] = useState(investigation?.contractNumber || '')
  const [contractDate, setContractDate] = useState(investigation?.contractDate || '')
  const [startDate, setStartDate] = useState(investigation?.startDate || '')
  const [endDate, setEndDate] = useState(investigation?.endDate || '')
  const [description, setDescription] = useState(investigation?.description || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      isCustom,
      status,
      contractorName,
      contractorContact,
      contractorPhone,
      contractorEmail,
      contractNumber,
      contractDate,
      startDate,
      endDate,
      description
    })
  }

  // При выборе стандартного изыскания
  const handleStandardSelect = (standardId: string) => {
    const standard = standardInvestigations.find(s => s.id === standardId)
    if (standard) {
      setName(standard.name)
      setIsCustom(false)
    }
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
      title={investigation ? 'Редактировать изыскание' : 'Добавить изыскание'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Выбор из списка */}
        <div className="space-y-2">
          <Label>Выбрать из списка</Label>
          <select
            onChange={(e) => handleStandardSelect(e.target.value)}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            value=""
            disabled={isCustom}
          >
            <option value="">-- Выберите изыскание --</option>
            {standardInvestigations.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="text-center text-gray-400 text-sm">— или —</div>

        <div className="space-y-2">
          <Label>Другое (введите название)</Label>
          <Input
            value={isCustom ? name : ''}
            onChange={e => {
              setName(e.target.value)
              setIsCustom(true)
            }}
            placeholder="Название нестандартного изыскания"
          />
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

        <hr className="my-4" />
        <h4 className="font-medium text-sm">Данные о подрядчике</h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Организация</Label>
            <Input
              value={contractorName}
              onChange={e => setContractorName(e.target.value)}
              placeholder='ООО "Изыскания"'
            />
          </div>
          <div className="space-y-2">
            <Label>Контактное лицо</Label>
            <Input
              value={contractorContact}
              onChange={e => setContractorContact(e.target.value)}
              placeholder="Иванов И.И."
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Телефон</Label>
            <Input
              value={contractorPhone}
              onChange={e => setContractorPhone(e.target.value)}
              placeholder="+7 (999) 123-45-67"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={contractorEmail}
              onChange={e => setContractorEmail(e.target.value)}
              placeholder="mail@example.com"
            />
          </div>
        </div>

        <hr className="my-4" />
        <h4 className="font-medium text-sm">Договор</h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Номер договора</Label>
            <Input
              value={contractNumber}
              onChange={e => setContractNumber(e.target.value)}
              placeholder="№ 123/2024"
            />
          </div>
          <div className="space-y-2">
            <Label>Дата договора</Label>
            <Input
              type="date"
              value={contractDate}
              onChange={e => setContractDate(e.target.value)}
            />
          </div>
        </div>

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

        <div className="space-y-2">
          <Label>Примечание</Label>
          <Input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Дополнительная информация"
          />
        </div>

        <div className="flex justify-between gap-2 pt-4">
          <div>
            {investigation && onDelete && (
              <Button type="button" variant="destructive" onClick={onDelete}>
                Удалить
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {investigation ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </div>
      </form>
    </SimpleModal>
  )
}
