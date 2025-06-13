"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { 
  User, 
  Building2, 
  DollarSign, 
  Calendar, 
  Phone, 
  Mail,
  MoreHorizontal 
} from "lucide-react"

interface Lead {
  id: number
  name: string
  email: string
  company?: string
  jobTitle?: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  priority: 'low' | 'medium' | 'high'
  source: string
  estimatedValue?: number
  lastContactedAt?: string
  nextFollowUpAt?: string
  createdAt: string
}

interface LeadPipelineProps {
  leads: Lead[]
}

const pipelineStages = [
  { status: 'new', label: 'New Leads', color: 'bg-gray-100' },
  { status: 'contacted', label: 'Contacted', color: 'bg-blue-100' },
  { status: 'qualified', label: 'Qualified', color: 'bg-yellow-100' },
  { status: 'proposal', label: 'Proposal', color: 'bg-orange-100' },
  { status: 'negotiation', label: 'Negotiation', color: 'bg-purple-100' },
  { status: 'closed_won', label: 'Won', color: 'bg-green-100' },
  { status: 'closed_lost', label: 'Lost', color: 'bg-red-100' },
] as const

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
}

export function LeadPipeline({ leads }: LeadPipelineProps) {
  const getLeadsByStatus = (status: string) => {
    return leads?.filter(lead => lead?.status === status) || []
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Overview */}
      <div className="grid grid-cols-7 gap-4">
        {pipelineStages.map(stage => {
          const stageLeads = getLeadsByStatus(stage.status)
          const stageValue = stageLeads.reduce((sum, lead) => sum + (lead?.estimatedValue || 0), 0)
          
          return (
            <div key={stage.status} className={`rounded-lg p-3 ${stage.color}`}>
              <div className="text-sm font-medium text-gray-900">{stage.label}</div>
              <div className="text-lg font-bold text-gray-900">{stageLeads.length}</div>
              {stageValue > 0 && (
                <div className="text-xs text-gray-600">{formatCurrency(stageValue)}</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Pipeline Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 min-h-96">
        {pipelineStages.map(stage => {
          const stageLeads = getLeadsByStatus(stage.status)
          
          return (
            <div key={stage.status} className="space-y-3">
              <div className="font-medium text-sm text-gray-700 border-b pb-2">
                {stage.label} ({stageLeads.length})
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {stageLeads.map(lead => (
                  <Card key={lead.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{lead.name}</div>
                          {lead.company && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Building2 className="h-3 w-3" />
                              {lead.company}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${priorityColors[lead.priority]}`}
                          >
                            {lead.priority}
                          </Badge>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0 pb-3">
                      <div className="space-y-2">
                        {lead.jobTitle && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <User className="h-3 w-3" />
                            {lead.jobTitle}
                          </div>
                        )}
                        
                        {lead.estimatedValue && (
                          <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(lead.estimatedValue)}
                          </div>
                        )}
                        
                        {lead.nextFollowUpAt && (
                          <div className="flex items-center gap-1 text-xs text-orange-600">
                            <Calendar className="h-3 w-3" />
                            Follow up: {formatDate(lead.nextFollowUpAt)}
                          </div>
                        )}
                        
                        <div className="flex gap-1 mt-2">
                          <Button variant="outline" size="sm" className="h-6 text-xs gap-1">
                            <Mail className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-6 text-xs gap-1">
                            <Phone className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {stageLeads.length === 0 && (
                  <div className="text-center text-gray-400 text-sm py-8">
                    No leads in this stage
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
} 