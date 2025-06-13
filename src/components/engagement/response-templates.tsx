"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  FileText,
  Plus,
  Edit,
  Copy,
  Trash,
  MoreHorizontal,
  Save,
  TrendingUp
} from "lucide-react"

interface ResponseTemplate {
  id: number
  title: string
  content: string
  category: 'appreciation' | 'question_answer' | 'follow_up' | 'networking' | 'general'
  usage_count: number
  createdAt: string
}

interface ResponseTemplatesProps {
  templates: ResponseTemplate[]
}

const categoryColors = {
  appreciation: 'bg-green-100 text-green-800',
  question_answer: 'bg-blue-100 text-blue-800',
  follow_up: 'bg-orange-100 text-orange-800',
  networking: 'bg-purple-100 text-purple-800',
  general: 'bg-gray-100 text-gray-800',
}

const categoryOptions = [
  { value: 'appreciation', label: 'Appreciation' },
  { value: 'question_answer', label: 'Question & Answer' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'networking', label: 'Networking' },
  { value: 'general', label: 'General' },
]

export function ResponseTemplates({ templates }: ResponseTemplatesProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ResponseTemplate | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general' as ResponseTemplate['category']
  })

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'general'
    })
  }

  const handleCreate = () => {
    // Here you would create the template via API
    console.log('Creating template:', formData)
    setIsCreateDialogOpen(false)
    resetForm()
  }

  const handleEdit = (template: ResponseTemplate) => {
    setEditingTemplate(template)
    setFormData({
      title: template.title,
      content: template.content,
      category: template.category
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = () => {
    // Here you would update the template via API
    console.log('Updating template:', editingTemplate?.id, formData)
    setIsEditDialogOpen(false)
    setEditingTemplate(null)
    resetForm()
  }

  const handleDelete = (templateId: number) => {
    // Here you would delete the template via API
    console.log('Deleting template:', templateId)
  }

  const handleCopy = (template: ResponseTemplate) => {
    navigator.clipboard.writeText(template.content)
    // You could show a toast notification here
    console.log('Template copied to clipboard')
  }

  const filteredTemplates = templates?.filter(template => {
    if (selectedCategory === 'all') return true
    return template.category === selectedCategory
  }) || []

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (!templates || templates.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="text-gray-400 text-lg mb-2">No response templates</div>
        <div className="text-gray-500 text-sm mb-4">Create templates to respond faster to comments</div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Response Template</DialogTitle>
            </DialogHeader>
            <CreateTemplateForm 
              formData={formData}
              setFormData={setFormData}
              onSave={handleCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Category Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium">Response Templates</h3>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Response Template</DialogTitle>
            </DialogHeader>
            <CreateTemplateForm 
              formData={formData}
              setFormData={setFormData}
              onSave={handleCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h4 className="font-medium">{template.title}</h4>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={`${categoryColors[template.category]} capitalize`}
                    >
                      {template.category.replace('_', ' ')}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <TrendingUp className="h-3 w-3" />
                      Used {template.usage_count} times
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(template)} className="gap-2">
                      <Edit className="h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopy(template)} className="gap-2">
                      <Copy className="h-4 w-4" />
                      Copy Content
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(template.id)} 
                      className="gap-2 text-red-600"
                    >
                      <Trash className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-800 line-clamp-3">{template.content}</p>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Created {formatDate(template.createdAt)}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(template)}
                    className="gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Response Template</DialogTitle>
          </DialogHeader>
          <CreateTemplateForm 
            formData={formData}
            setFormData={setFormData}
            onSave={handleUpdate}
            onCancel={() => setIsEditDialogOpen(false)}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Extracted form component for reuse
function CreateTemplateForm({ 
  formData, 
  setFormData, 
  onSave, 
  onCancel, 
  isEditing = false 
}: {
  formData: any
  setFormData: (data: any) => void
  onSave: () => void
  onCancel: () => void
  isEditing?: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Template Title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Thank you response"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Template Content</label>
        <Textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Write your response template..."
          className="min-h-32"
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={onSave}
          disabled={!formData.title.trim() || !formData.content.trim()}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isEditing ? 'Update' : 'Create'} Template
        </Button>
      </div>
    </div>
  )
} 