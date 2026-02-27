'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Edit, CheckCircle2, Paperclip, Plus, Trash2, UserPlus } from 'lucide-react'
import type { Expertise, Expert, ExpertiseRemark, Section } from '@/types'
import { getRemarkStatusBadge } from '@/lib/utils'

interface ExpertiseDetailPageProps {
  expertise: Expertise
  sections: Section[]
  onClose: () => void
  onAddExpert: (data: Expert) => void
  onAddRemark: () => void
  onCloseRemark: (remarkId: string) => void
}

export function ExpertiseDetailPage({
  expertise,
  sections,
  onClose,
  onAddExpert,
  onAddRemark,
  onCloseRemark
}: ExpertiseDetailPageProps) {
  const [showExpertForm, setShowExpertForm] = useState(false)
  const [showRemarkForm, setShowRemarkForm] = useState(false)
  const [expertForm, setExpertForm] = useState({ name: '', phone: '', email: '', organization: '' })
  const [remarkForm, setRemarkForm] = useState({ content: '', sectionId: '', number: '' })

  const handleAddExpert = () => {
    if (!expertForm.name.trim()) return
    const currentExperts = expertise.experts || []
    onAddExpert({ ...expertForm })
    setShowExpertForm(false)
    setExpertForm({ name: '', phone: '', email: '', organization: '' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Экспертиза</h1>
          <p className="text-muted-foreground">{expertise.stageName || 'Этап экспертизы'}</p>
        </div>
      </div>

      <Tabs defaultValue="experts">
        <TabsList>
          <TabsTrigger value="experts">Эксперты</TabsTrigger>
          <TabsTrigger value="remarks">Замечания ({expertise.remarks?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="experts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Эксперты</h3>
            <Button onClick={() => setShowExpertForm(true)}>
              <UserPlus className="h-4 w-4 mr-2" /> Добавить эксперта
            </Button>
          </div>

          {showExpertForm && (
            <Card>
              <CardContent className="pt-4 space-y-3">
                <Input placeholder="ФИО *" value={expertForm.name} onChange={e => setExpertForm({ ...expertForm, name: e.target.value })} />
                <Input placeholder="Организация" value={expertForm.organization} onChange={e => setExpertForm({ ...expertForm, organization: e.target.value })} />
                <Input placeholder="Телефон" value={expertForm.phone} onChange={e => setExpertForm({ ...expertForm, phone: e.target.value })} />
                <Input placeholder="Email" value={expertForm.email} onChange={e => setExpertForm({ ...expertForm, email: e.target.value })} />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowExpertForm(false)}>Отмена</Button>
                  <Button onClick={handleAddExpert}>Добавить</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {(!expertise.experts || expertise.experts.length === 0) ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">Эксперты не добавлены</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expertise.experts?.map((expert, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{expert.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    {expert.organization && <p className="text-muted-foreground">{expert.organization}</p>}
                    {expert.phone && <p>Тел: {expert.phone}</p>}
                    {expert.email && <p>Email: {expert.email}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="remarks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Замечания</h3>
            <Button onClick={onAddRemark}>
              <Plus className="h-4 w-4 mr-2" /> Добавить замечание
            </Button>
          </div>

          {(!expertise.remarks || expertise.remarks.length === 0) ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <p className="text-muted-foreground">Замечаний нет</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {expertise.remarks.map(remark => (
                <Card key={remark.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {remark.sectionCode && <Badge variant="outline">Раздел {remark.sectionCode}</Badge>}
                    {remark.number && <Badge variant="outline">№ {remark.number}</Badge>}
                  </div>
                  {getRemarkStatusBadge(remark.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{remark.content}</p>
                {remark.fileName && remark.filePath && (
                  <a href={remark.filePath} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Paperclip className="h-4 w-4" />{remark.fileName}
                  </a>
                )}
                {remark.responseContent && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-1">Ответ исполнителя:</p>
                    <p className="text-sm text-blue-700">{remark.responseContent}</p>
                  </div>
                )}
                {remark.status === 'responded' && (
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => onCloseRemark(remark.id)}>
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Закрыть замечание
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
