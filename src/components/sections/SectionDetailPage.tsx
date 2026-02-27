'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft, Edit, Upload, Paperclip, Trash2, FileText,
  CheckCircle2, FileCheck, Download, MessageCircle, Send
} from 'lucide-react'
import { Section, User, IntroBlock, ExpertiseRemark, Message } from '@/types'
import { api, getInitials } from '@/lib/api'

interface SectionDetailPageProps {
  section: Section
  users: User[]
  onClose: () => void
  onEdit: (section: Section) => void
  onRefresh: () => void
}

export function SectionDetailPage({ section, users, onClose, onEdit, onRefresh }: SectionDetailPageProps) {
  const [activeTab, setActiveTab] = useState('info')
  const [introBlocks, setIntroBlocks] = useState<IntroBlock[]>([])
  const [remarks, setRemarks] = useState<ExpertiseRemark[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newComment, setNewComment] = useState('')
  const [responseText, setResponseText] = useState('')
  const completeFileRef = useRef<HTMLInputElement>(null)
  const responseFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadSectionData = async () => {
      const data = await api(`/api/sections/${section.id}`)
      if (data.success && data.section) {
        setIntroBlocks(data.section.introBlocks || [])
        setRemarks(data.section.remarks || [])
      }
      const msgData = await api(`/api/sections/${section.id}/messages`)
      if (msgData.success) {
        setMessages(msgData.messages || [])
      }
    }
    loadSectionData()
  }, [section.id])

  const handleSendComment = async () => {
    if (!newComment.trim()) return
    const response = await api(`/api/sections/${section.id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content: newComment })
    })
    if (response.success) {
      setNewComment('')
      const msgData = await api(`/api/sections/${section.id}/messages`)
      if (msgData.success) setMessages(msgData.messages || [])
    } else {
      alert(response.error || 'Ошибка отправки')
    }
  }

  const handleUploadCompleteFile = async () => {
    const file = completeFileRef.current?.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    const token = localStorage.getItem('token')
    const res = await fetch(`/api/sections/${section.id}/upload-complete`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData
    })
    const data = await res.json()

    if (data.success) {
      onRefresh()
      // Reload section data
      const sectionData = await api(`/api/sections/${section.id}`)
      if (sectionData.success && sectionData.section) {
        setIntroBlocks(sectionData.section.introBlocks || [])
        setRemarks(sectionData.section.remarks || [])
      }
    } else {
      alert(data.error || 'Ошибка загрузки файла')
    }
  }

  const handleDeleteIntroBlock = async (blockId: string) => {
    if (!confirm('Удалить блок?')) return
    const response = await api(`/api/intro-blocks/${blockId}`, { method: 'DELETE' })
    if (response.success) {
      setIntroBlocks(introBlocks.filter(b => b.id !== blockId))
    } else {
      alert(response.error || 'Ошибка удаления блока')
    }
  }

  const handleAddResponse = async (remarkId: string) => {
    if (!responseText.trim()) return

    const formData = new FormData()
    formData.append('responseContent', responseText)
    formData.append('status', 'responded')

    const file = responseFileRef.current?.files?.[0]
    if (file) formData.append('file', file)

    const token = localStorage.getItem('token')
    const res = await fetch(`/api/remarks/${remarkId}/response`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData
    })
    const data = await res.json()

    if (data.success) {
      setResponseText('')
      const sectionData = await api(`/api/sections/${section.id}`)
      if (sectionData.success && sectionData.section) {
        setRemarks(sectionData.section.remarks || [])
      }
    } else {
      alert(data.error || 'Ошибка отправки ответа')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      not_started: 'bg-gray-100 text-gray-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      in_work: 'bg-blue-100 text-blue-700',
    }
    const labels: Record<string, string> = {
      not_started: 'Не начат',
      in_progress: 'В работе',
      completed: 'Завершён',
      in_work: 'В работе',
    }
    return <Badge className={styles[status] || styles.not_started}>{labels[status] || status}</Badge>
  }

  const getRemarkStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: 'bg-red-100 text-red-700',
      responded: 'bg-yellow-100 text-yellow-700',
      closed: 'bg-green-100 text-green-700',
    }
    const labels: Record<string, string> = {
      open: 'Открыто',
      responded: 'Ответ дан',
      closed: 'Закрыто',
    }
    return <Badge className={styles[status]}>{labels[status]}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Раздел {section.code}</h1>
          <p className="text-muted-foreground">{section.description || 'Без описания'}</p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(section.status)}
          <Button variant="outline" size="sm" onClick={() => onEdit(section)}>
            <Edit className="h-4 w-4 mr-1" /> Редактировать
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="info">Информация</TabsTrigger>
          <TabsTrigger value="intro">Вводные данные</TabsTrigger>
          <TabsTrigger value="files">Готовый файл</TabsTrigger>
          <TabsTrigger value="remarks">Замечания ({remarks.length})</TabsTrigger>
          <TabsTrigger value="comments">Комментарии ({messages.length})</TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Информация о разделе</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Шифр</p>
                  <p className="font-medium">{section.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Статус</p>
                  {getStatusBadge(section.status)}
                </div>
              </div>
              {section.assignee && (
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Avatar style={{ backgroundColor: section.assignee.avatarColor || '#3B82F6' }}>
                    <AvatarFallback className="text-white">{getInitials(section.assignee.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-muted-foreground">Исполнитель</p>
                    <p className="font-medium">{section.assignee.name}</p>
                  </div>
                </div>
              )}
              {section.coAssignees && section.coAssignees.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Соисполнители</p>
                  <div className="flex flex-wrap gap-2">
                    {section.coAssignees.map((coId: string) => {
                      const coUser = users.find(u => u.id === coId)
                      return coUser ? (
                        <div key={coId} className="flex items-center gap-2 bg-muted rounded-full px-3 py-1">
                          <Avatar className="h-5 w-5" style={{ backgroundColor: coUser.avatarColor || '#3B82F6' }}>
                            <AvatarFallback className="text-xs text-white">{getInitials(coUser.name)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{coUser.name}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Intro Data Tab */}
        <TabsContent value="intro" className="space-y-4">
          <h3 className="text-lg font-semibold">Вводные данные</h3>
          {introBlocks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Нет вводных данных</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {introBlocks.map(block => (
                <Card key={block.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{block.title}</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteIntroBlock(block.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {block.type === 'text' && block.content && (
                      <p className="text-sm whitespace-pre-wrap">{block.content}</p>
                    )}
                    {block.type === 'file' && block.filePath && (
                      <a href={block.filePath} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <Paperclip className="h-4 w-4" />
                        {block.fileName || 'Скачать файл'}
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Complete File Tab */}
        <TabsContent value="files" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Готовый файл раздела</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {section.completedFile ? (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileCheck className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium">{section.completedFileName}</p>
                      <p className="text-sm text-muted-foreground">Файл загружен</p>
                    </div>
                  </div>
                  <a href={section.completedFile} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Скачать</Button>
                  </a>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Файл не загружен</p>
              )}
              <div className="border-2 border-dashed rounded-lg p-6">
                <input type="file" ref={completeFileRef} className="hidden" onChange={handleUploadCompleteFile} />
                <div className="text-center">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                  <Button variant="outline" onClick={() => completeFileRef.current?.click()}>Загрузить файл</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Remarks Tab */}
        <TabsContent value="remarks" className="space-y-4">
          <h3 className="text-lg font-semibold">Замечания эксперта</h3>
          {remarks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <p className="text-muted-foreground">Замечаний нет</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {remarks.map(remark => (
                <Card key={remark.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {remark.createdAt && new Date(remark.createdAt).toLocaleDateString('ru-RU')}
                        </span>
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
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-800 mb-1">Ответ:</p>
                        <p className="text-sm text-green-700">{remark.responseContent}</p>
                        {remark.responseFileName && remark.responseFile && (
                          <a href={remark.responseFile} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-green-600 hover:underline mt-2">
                            <Paperclip className="h-4 w-4" />{remark.responseFileName}
                          </a>
                        )}
                      </div>
                    )}
                    {remark.status === 'open' && (
                      <div className="mt-4 space-y-3">
                        <Textarea placeholder="Введите ответ..." value={responseText} onChange={e => setResponseText(e.target.value)} />
                        <div className="flex items-center gap-2">
                          <input type="file" ref={responseFileRef} className="hidden" />
                          <Button variant="outline" size="sm" onClick={() => responseFileRef.current?.click()}>
                            <Paperclip className="h-4 w-4 mr-1" /> Прикрепить файл
                          </Button>
                          <Button size="sm" onClick={() => handleAddResponse(remark.id)} disabled={!responseText.trim()}>
                            <Send className="h-4 w-4 mr-1" /> Отправить ответ
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="space-y-4">
          <h3 className="text-lg font-semibold">Стена комментариев</h3>
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <Textarea placeholder="Написать комментарий..." value={newComment} onChange={e => setNewComment(e.target.value)} rows={3} />
                <div className="flex justify-end">
                  <Button onClick={handleSendComment} disabled={!newComment.trim()}>
                    <Send className="h-4 w-4 mr-2" /> Отправить
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          {messages.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Нет комментариев</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {messages.map(message => (
                <Card key={message.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Avatar style={{ backgroundColor: message.author?.avatarColor || '#3B82F6' }}>
                        <AvatarFallback className="text-white text-sm">
                          {message.author ? getInitials(message.author.name) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{message.author?.name || 'Неизвестно'}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.createdAt).toLocaleString('ru-RU')}
                          </span>
                          {message.isCritical && <Badge variant="destructive" className="text-xs">Важно</Badge>}
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.fileName && message.filePath && (
                          <a href={message.filePath} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline mt-2">
                            <Paperclip className="h-4 w-4" />{message.fileName}
                          </a>
                        )}
                      </div>
                    </div>
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
