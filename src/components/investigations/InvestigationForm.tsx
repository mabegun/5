'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DialogFooter } from '@/components/ui/dialog'
import type { StandardInvestigation } from '@/types'

interface InvestigationFormProps {
  standardInvestigations: StandardInvestigation[]
  onSubmit: (data: {
    isCustom: boolean
    standardId: string | null
    customName: string | null
    contractorName: string
    contractorPhone: string
    status: string
  }) => void
  onCancel: () => void
}

export function InvestigationForm({ standardInvestigations, onSubmit, onCancel }: InvestigationFormProps) {
  const [isCustom, setIsCustom] = useState(false)
  const [standardId, setStandardId] = useState('')
  const [customName, setCustomName] = useState('')
  const [contractorName, setContractorName] = useState('')
  const [contractorPhone, setContractorPhone] = useState('')
  const [status, setStatus] = useState('not_started')

  const handleSubmit = () => {
    onSubmit({
      isCustom,
      standardId: isCustom ? null : standardId,
      customName: isCustom ? customName : null,
      contractorName,
      contractorPhone,
      status
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Тип изыскания</Label>
        <Select
          value={isCustom ? 'custom' : standardId}
          onValueChange={v => {
            if (v === 'custom') {
              setIsCustom(true)
            } else {
              setIsCustom(false)
              setStandardId(v)
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите из списка" />
          </SelectTrigger>
          <SelectContent>
            {standardInvestigations.map(i => (
              <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
            ))}
            <SelectItem value="custom">— Другое —</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isCustom && (
        <div>
          <Label>Название *</Label>
          <Input
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            placeholder="Название изыскания"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Организация</Label>
          <Input
            value={contractorName}
            onChange={e => setContractorName(e.target.value)}
            placeholder="Название организации"
          />
        </div>
        <div>
          <Label>Телефон</Label>
          <Input
            value={contractorPhone}
            onChange={e => setContractorPhone(e.target.value)}
            placeholder="+7 (999) 123-45-67"
          />
        </div>
      </div>

      <div>
        <Label>Статус</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="not_started">Не начат</SelectItem>
            <SelectItem value="in_progress">В работе</SelectItem>
            <SelectItem value="completed">Завершён</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Отмена</Button>
        <Button onClick={handleSubmit}>Создать</Button>
      </DialogFooter>
    </div>
  )
}
