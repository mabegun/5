'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download } from 'lucide-react'
import type { Investigation } from '@/types'
import { getStatusBadge } from '@/lib/utils'

interface InvestigationDetailProps {
  investigation: Investigation
  onClose: () => void
}

export function InvestigationDetail({ investigation, onClose }: InvestigationDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{investigation.name || investigation.customName}</h1>
        </div>
        {getStatusBadge(investigation.status)}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Информация об изыскании</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {investigation.contractorName && (
              <div>
                <p className="text-sm text-muted-foreground">Организация</p>
                <p className="font-medium">{investigation.contractorName}</p>
              </div>
            )}
            {investigation.contractorContact && (
              <div>
                <p className="text-sm text-muted-foreground">Контактное лицо</p>
                <p className="font-medium">{investigation.contractorContact}</p>
              </div>
            )}
            {investigation.contractorPhone && (
              <div>
                <p className="text-sm text-muted-foreground">Телефон</p>
                <p className="font-medium">{investigation.contractorPhone}</p>
              </div>
            )}
            {investigation.contractorEmail && (
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{investigation.contractorEmail}</p>
              </div>
            )}
            {investigation.contractNumber && (
              <div>
                <p className="text-sm text-muted-foreground">Номер договора</p>
                <p className="font-medium">{investigation.contractNumber}</p>
              </div>
            )}
            {investigation.contractDate && (
              <div>
                <p className="text-sm text-muted-foreground">Дата договора</p>
                <p className="font-medium">{new Date(investigation.contractDate).toLocaleDateString('ru-RU')}</p>
              </div>
            )}
          </div>
          {investigation.resultFile && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Результат изыскания</p>
              <a href={investigation.resultFile} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" /> {investigation.resultFileName || 'Скачать'}
                </Button>
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
