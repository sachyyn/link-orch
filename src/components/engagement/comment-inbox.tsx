"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  MessageSquare,
  Reply,
  ExternalLink,
  MoreHorizontal,
  Clock,
  User,
  FileText,
  Send,
  Heart,
  Frown,
  Meh
} from "lucide-react"

interface Comment {
  id: number
  postId: number
  postTitle: string
  authorName: string
  authorProfileUrl?: string
  content: string
  status: 'unread' | 'read' | 'replied' | 'ignored'
  priority: 'low' | 'medium' | 'high'
  sentiment: 'positive' | 'neutral' | 'negative'
  createdAt: string
  linkedinUrl?: string
}

interface ResponseTemplate {
  id: number
  title: string
  content: string
  category: string
  usage_count: number
  createdAt: string
}

interface CommentInboxProps {
  comments: Comment[]
  templates: ResponseTemplate[]
}

const statusColors = {
  unread: 'bg-orange-100 text-orange-800',
  read: 'bg-blue-100 text-blue-800',
  replied: 'bg-green-100 text-green-800',
  ignored: 'bg-gray-100 text-gray-800',
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
}

const sentimentIcons = {
  positive: <Heart className="h-4 w-4 text-green-600" />,
  neutral: <Meh className="h-4 w-4 text-gray-600" />,
  negative: <Frown className="h-4 w-4 text-red-600" />,
}

export function CommentInbox({ comments, templates }: CommentInboxProps) {
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleReply = (comment: Comment) => {
    setSelectedComment(comment)
    setReplyContent('')
    setSelectedTemplate('')
    setIsReplyDialogOpen(true)
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id.toString() === templateId)
    if (template) {
      setReplyContent(template.content)
    }
    setSelectedTemplate(templateId)
  }

  const handleSendReply = () => {
    // Here you would typically send the reply via API
    console.log('Sending reply:', replyContent)
    setIsReplyDialogOpen(false)
    setReplyContent('')
    setSelectedTemplate('')
    setSelectedComment(null)
  }

  const markAsRead = (commentId: number) => {
    // Here you would update the comment status via API
    console.log('Marking comment as read:', commentId)
  }

  const markAsReplied = (commentId: number) => {
    // Here you would update the comment status via API
    console.log('Marking comment as replied:', commentId)
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="text-gray-400 text-lg mb-2">No comments found</div>
        <div className="text-gray-500 text-sm">Comments will appear here when people engage with your posts</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">{comment.authorName}</span>
                  </div>
                  
                  <Badge 
                    variant="secondary" 
                    className={`${statusColors[comment.status]} capitalize`}
                  >
                    {comment.status}
                  </Badge>
                  
                  <Badge 
                    variant="outline" 
                    className={`${priorityColors[comment.priority]} capitalize`}
                  >
                    {comment.priority}
                  </Badge>
                  
                  <div className="flex items-center gap-1">
                    {sentimentIcons[comment.sentiment]}
                    <span className="text-xs text-gray-500 capitalize">{comment.sentiment}</span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  on "{comment.postTitle}"
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {formatDate(comment.createdAt)}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => markAsRead(comment.id)}>
                      Mark as Read
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => markAsReplied(comment.id)}>
                      Mark as Replied
                    </DropdownMenuItem>
                    {comment.linkedinUrl && (
                      <DropdownMenuItem asChild>
                        <a href={comment.linkedinUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                          <ExternalLink className="h-4 w-4" />
                          View on LinkedIn
                        </a>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-800">{comment.content}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleReply(comment)}
                  className="gap-2"
                >
                  <Reply className="h-4 w-4" />
                  Reply
                </Button>
                
                {comment.authorProfileUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="gap-2"
                  >
                    <a href={comment.authorProfileUrl} target="_blank" rel="noopener noreferrer">
                      <User className="h-4 w-4" />
                      View Profile
                    </a>
                  </Button>
                )}
                
                {comment.linkedinUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="gap-2"
                  >
                    <a href={comment.linkedinUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      View Comment
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to {selectedComment?.authorName}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Original Comment */}
            {selectedComment && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-2">Original comment:</div>
                <p className="text-gray-800">{selectedComment.content}</p>
              </div>
            )}
            
            {/* Template Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Use a template (optional):</label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a response template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {template.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Reply Content */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Your reply:</label>
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                className="min-h-24"
              />
            </div>
            
            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendReply}
                disabled={!replyContent.trim()}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Send Reply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 