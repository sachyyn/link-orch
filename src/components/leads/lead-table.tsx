"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Edit,
  Mail,
  Phone,
  Calendar
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

interface LeadTableProps {
  leads: Lead[]
}

type SortField = 'name' | 'company' | 'status' | 'priority' | 'estimatedValue' | 'createdAt'
type SortDirection = 'asc' | 'desc'

const statusColors = {
  new: 'bg-gray-100 text-gray-800',
  contacted: 'bg-blue-100 text-blue-800',
  qualified: 'bg-yellow-100 text-yellow-800',
  proposal: 'bg-orange-100 text-orange-800',
  negotiation: 'bg-purple-100 text-purple-800',
  closed_won: 'bg-green-100 text-green-800',
  closed_lost: 'bg-red-100 text-red-800',
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
}

export function LeadTable({ leads }: LeadTableProps) {
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedLeads = [...(leads || [])].sort((a, b) => {
    let aValue: any = a[sortField]
    let bValue: any = b[sortField]

    // Handle null/undefined values
    if (aValue === null || aValue === undefined) aValue = ''
    if (bValue === null || bValue === undefined) bValue = ''

    // Convert to string for comparison
    if (typeof aValue === 'string') aValue = aValue.toLowerCase()
    if (typeof bValue === 'string') bValue = bValue.toLowerCase()

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(field)}
      className="h-auto p-0 font-semibold text-left justify-start"
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  )

  if (!leads || leads.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <div className="text-gray-400 text-lg mb-2">No leads found</div>
        <div className="text-gray-500 text-sm">Start by adding your first lead</div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortButton field="name">Lead</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="company">Company</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="status">Status</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="priority">Priority</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="estimatedValue">Value</SortButton>
            </TableHead>
            <TableHead>Source</TableHead>
            <TableHead>
              <SortButton field="createdAt">Created</SortButton>
            </TableHead>
            <TableHead>Next Follow-up</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedLeads.map((lead) => (
            <TableRow key={lead.id} className="hover:bg-gray-50">
              <TableCell>
                <div>
                  <div className="font-medium">{lead.name}</div>
                  <div className="text-sm text-gray-600">{lead.email}</div>
                  {lead.jobTitle && (
                    <div className="text-xs text-gray-500">{lead.jobTitle}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{lead.company || '-'}</div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="secondary" 
                  className={`${statusColors[lead.status]} capitalize`}
                >
                  {lead.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="secondary" 
                  className={`${priorityColors[lead.priority]} capitalize`}
                >
                  {lead.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="font-medium text-green-600">
                  {formatCurrency(lead.estimatedValue)}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm capitalize">{lead.source.replace('_', ' ')}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{formatDate(lead.createdAt)}</div>
                {lead.lastContactedAt && (
                  <div className="text-xs text-gray-500">
                    Last contact: {formatDate(lead.lastContactedAt)}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {lead.nextFollowUpAt ? (
                  <div className="text-sm text-orange-600">
                    {formatDate(lead.nextFollowUpAt)}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">Not scheduled</div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Phone className="h-4 w-4" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <Eye className="h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit Lead
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <Calendar className="h-4 w-4" />
                        Schedule Follow-up
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <Mail className="h-4 w-4" />
                        Send Email
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 