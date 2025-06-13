"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Calendar,
  Eye,
  Copy,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"

// Post type definition
interface Post {
  id: number
  title: string
  content: string
  status: 'draft' | 'scheduled' | 'published' | 'failed' | 'archived'
  scheduledAt: string | null
  publishedAt: string | null
  pillarName?: string
  hashtags: string[]
  viewCount: number
  createdAt: string
  updatedAt: string
}

interface ContentPillar {
  id: string
  name: string
  description?: string
  color: string
  targetPercentage?: number
  postCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  userId: string
}

interface ContentTableProps {
  posts: Post[]
  searchQuery: string
  pillars: ContentPillar[]
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  published: 'bg-green-100 text-green-800 border-green-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
  archived: 'bg-yellow-100 text-yellow-800 border-yellow-200',
}

// Note: pillars parameter is passed for future filtering functionality
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ContentTable({ posts, searchQuery, pillars }: ContentTableProps) {
  const router = useRouter()
  const [data, setData] = useState<Post[]>(posts)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Update data when posts prop changes
  useEffect(() => {
    setData(posts)
  }, [posts])

  const handleEdit = (postId: number) => {
    router.push(`/content/${postId}/edit`)
  }

  const handleDuplicate = (postId: number) => {
    console.log("Duplicate post:", postId)
    // Implement duplicate logic
  }

  const handleDelete = (postId: number) => {
    console.log("Delete post:", postId)
    // Implement delete logic with confirmation
  }

  const columns: ColumnDef<Post>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const post = row.original
        return (
          <div className="min-w-[250px]">
            <div className="font-medium truncate">{post.title}</div>
            <div className="text-sm text-muted-foreground truncate max-w-[300px]">
              {post.content.substring(0, 60)}...
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge 
            variant="outline" 
            className={statusColors[status as keyof typeof statusColors]}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      },
    },
    {
      accessorKey: "pillarName",
      header: "Pillar",
      cell: ({ row }) => {
        const pillar = row.getValue("pillarName") as string
        return pillar ? (
          <span className="text-sm">{pillar}</span>
        ) : (
          <span className="text-sm text-muted-foreground">No pillar</span>
        )
      },
    },
    {
      accessorKey: "scheduledAt",
      header: "Scheduled",
      cell: ({ row }) => {
        const scheduledAt = row.getValue("scheduledAt") as string | null
        if (!scheduledAt) return <span className="text-muted-foreground">-</span>
        
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-blue-500" />
            <span className="text-sm">
              {format(new Date(scheduledAt), "MMM d, h:mm a")}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "viewCount",
      header: "Views",
      cell: ({ row }) => {
        const views = row.getValue("viewCount") as number
        return (
          <div className="flex items-center gap-2">
            <Eye className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{views.toLocaleString()}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string
        return (
          <span className="text-sm text-muted-foreground">
            {format(new Date(date), "MMM d, yyyy")}
          </span>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const post = row.original
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                handleEdit(post.id)
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                handleDuplicate(post.id)
              }}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(post.id)
                }}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  })

  // Filter data based on search query
  useEffect(() => {
    if (searchQuery) {
      setColumnFilters([
        {
          id: "title",
          value: searchQuery,
        },
      ])
    } else {
      setColumnFilters([])
    }
  }, [searchQuery])

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow 
                  key={row.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleEdit(row.original.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No posts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{' '}
          of {table.getFilteredRowModel().rows.length} posts
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 