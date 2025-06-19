
'use client'

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Upload, Search, Filter, X, Download, Copy, Trash2, Plus, Eye, EyeOff, Camera } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { PhotoEditModal } from '@/components/photo-edit-modal'
import { generateThumbnail } from '@/lib/thumbnail-utils'
import type { Photo, Photographer, Brand } from '@/app/page'

interface PhotoOrganizerProps {
  photos: Photo[]
  setPhotos: (photos: Photo[]) => void
  photographers: Photographer[]
  brands: Brand[]
  selectedPhotos: string[]
  setSelectedPhotos: (selected: string[]) => void
}

export function PhotoOrganizer({
  photos,
  setPhotos,
  photographers,
  brands,
  selectedPhotos,
  setSelectedPhotos
}: PhotoOrganizerProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterPhotographer, setFilterPhotographer] = useState('all')
  const [filterBrand, setFilterBrand] = useState('all')
  const [filterScheduled, setFilterScheduled] = useState('all')
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null)
  
  // Quick actions state
  const [quickPhotographer, setQuickPhotographer] = useState('')
  const [quickBrands, setQuickBrands] = useState('')
  const [quickDate, setQuickDate] = useState('')
  const [quickTime, setQuickTime] = useState('')
  const [quickLocation, setQuickLocation] = useState('')
  const [quickPriority, setQuickPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [quickDescription, setQuickDescription] = useState('')
  const [quickHashtags, setQuickHashtags] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Generate thumbnail for uploaded image
  const createThumbnail = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      img.onload = () => {
        // Set thumbnail size (max 200px)
        const maxSize = 200
        let { width, height } = img
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', 0.8))
        } else {
          reject(new Error('Could not get canvas context'))
        }
      }
      
      img.onerror = () => reject(new Error('Could not load image'))
      img.src = URL.createObjectURL(file)
    })
  }, [])

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList) => {
    setIsUploading(true)
    const newPhotos: Photo[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file.type.startsWith('image/')) continue

        const originalUrl = URL.createObjectURL(file)
        const thumbnail = await createThumbnail(file)
        
        const photo: Photo = {
          id: `photo_${Date.now()}_${i}`,
          name: file.name,
          originalUrl,
          thumbnail,
          size: file.size,
          type: file.type,
          brands: [],
          priority: 'MEDIUM',
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        newPhotos.push(photo)
      }

      setPhotos([...photos, ...newPhotos])
      toast({
        title: 'Success',
        description: `Uploaded ${newPhotos.length} photo${newPhotos.length > 1 ? 's' : ''}`
      })
    } catch (error) {
      console.error('Error uploading files:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload some photos',
        variant: 'destructive'
      })
    } finally {
      setIsUploading(false)
    }
  }, [photos, setPhotos, createThumbnail, toast])

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }, [handleFileUpload])

  // Filter photos
  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photo.photographer?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPhotographer = filterPhotographer === 'all' || 
                               (filterPhotographer === 'empty' && !photo.photographer) ||
                               photo.photographer === filterPhotographer
    
    const matchesBrand = filterBrand === 'all' ||
                        (filterBrand === 'empty' && photo.brands.length === 0) ||
                        photo.brands.includes(filterBrand)
    
    const matchesScheduled = filterScheduled === 'all' ||
                            (filterScheduled === 'scheduled' && photo.scheduledDate) ||
                            (filterScheduled === 'unscheduled' && !photo.scheduledDate)
    
    return matchesSearch && matchesPhotographer && matchesBrand && matchesScheduled
  })

  // Selection handlers
  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(
      selectedPhotos.includes(photoId)
        ? selectedPhotos.filter(id => id !== photoId)
        : [...selectedPhotos, photoId]
    )
  }

  const selectAllPhotos = () => {
    setSelectedPhotos(filteredPhotos.map(p => p.id))
  }

  const clearSelection = () => {
    setSelectedPhotos([])
  }

  // Apply quick actions to selected photos
  const applyQuickActions = () => {
    if (selectedPhotos.length === 0) {
      toast({
        title: 'No photos selected',
        description: 'Please select photos to apply actions to',
        variant: 'destructive'
      })
      return
    }

    const updatedPhotos = photos.map(photo => {
      if (selectedPhotos.includes(photo.id)) {
        const updates: Partial<Photo> = { updatedAt: new Date() }
        
        if (quickPhotographer) updates.photographer = quickPhotographer
        if (quickBrands) updates.brands = quickBrands.split(',').map(b => b.trim()).filter(Boolean)
        if (quickDate) {
          updates.scheduledDate = new Date(quickDate)
          if (quickTime) updates.scheduledTime = quickTime
        }
        if (quickLocation) updates.location = quickLocation
        if (quickDescription) updates.description = quickDescription
        if (quickHashtags) updates.hashtags = quickHashtags
        updates.priority = quickPriority
        
        return { ...photo, ...updates }
      }
      return photo
    })

    setPhotos(updatedPhotos)
    toast({
      title: 'Success',
      description: `Applied actions to ${selectedPhotos.length} photo${selectedPhotos.length > 1 ? 's' : ''}`
    })
    
    // Clear quick actions form
    setQuickPhotographer('')
    setQuickBrands('')
    setQuickDate('')
    setQuickTime('')
    setQuickLocation('')
    setQuickPriority('MEDIUM')
    setQuickDescription('')
    setQuickHashtags('')
  }

  // Delete selected photos
  const deleteSelectedPhotos = () => {
    if (selectedPhotos.length === 0) return
    
    const updatedPhotos = photos.filter(photo => !selectedPhotos.includes(photo.id))
    setPhotos(updatedPhotos)
    setSelectedPhotos([])
    
    toast({
      title: 'Success',
      description: `Deleted ${selectedPhotos.length} photo${selectedPhotos.length > 1 ? 's' : ''}`
    })
  }

  // Export functions
  const exportCSV = () => {
    const headers = ['Name', 'Photographer', 'Brands', 'Scheduled Date', 'Description', 'Hashtags', 'Location', 'Priority']
    const csvData = [
      headers.join(','),
      ...filteredPhotos.map(photo => [
        `"${photo.name}"`,
        `"${photo.photographer || ''}"`,
        `"${photo.brands.join(', ')}"`,
        `"${photo.scheduledDate ? photo.scheduledDate.toISOString().split('T')[0] : ''}"`,
        `"${photo.description || ''}"`,
        `"${photo.hashtags || ''}"`,
        `"${photo.location || ''}"`,
        `"${photo.priority}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'photos-export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyHTMLTable = async () => {
    const tableHTML = `
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Photographer</th>
            <th>Brands</th>
            <th>Scheduled Date</th>
            <th>Description</th>
            <th>Hashtags</th>
            <th>Location</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          ${filteredPhotos.map(photo => `
            <tr>
              <td><img src="${photo.thumbnail || photo.originalUrl}" alt="${photo.name}" style="width: 50px; height: 50px; object-fit: cover;" /></td>
              <td>${photo.name}</td>
              <td>${photo.photographer || ''}</td>
              <td>${photo.brands.join(', ')}</td>
              <td>${photo.scheduledDate ? photo.scheduledDate.toISOString().split('T')[0] : ''}</td>
              <td>${photo.description || ''}</td>
              <td>${photo.hashtags || ''}</td>
              <td>${photo.location || ''}</td>
              <td>${photo.priority}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `

    try {
      await navigator.clipboard.writeText(tableHTML)
      toast({
        title: 'Success',
        description: 'HTML table copied to clipboard'
      })
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      toast({
        title: 'Error',
        description: 'Failed to copy HTML table',
        variant: 'destructive'
      })
    }
  }

  // Add test image
  const addTestImage = async () => {
    // Create a simple test image using canvas
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 300
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 400, 300)
      gradient.addColorStop(0, '#667eea')
      gradient.addColorStop(1, '#764ba2')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 400, 300)
      
      // Add text
      ctx.fillStyle = 'white'
      ctx.font = '24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Test Image', 200, 150)
      ctx.font = '16px Arial'
      ctx.fillText(new Date().toLocaleString(), 200, 180)
      
      const dataUrl = canvas.toDataURL('image/png')
      const thumbnail = canvas.toDataURL('image/png', 0.5) // Smaller thumbnail
      
      const testPhoto: Photo = {
        id: `test_${Date.now()}`,
        name: `test-image-${Date.now()}.png`,
        originalUrl: dataUrl,
        thumbnail,
        size: dataUrl.length,
        type: 'image/png',
        brands: [],
        priority: 'MEDIUM',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      setPhotos([...photos, testPhoto])
      toast({
        title: 'Success',
        description: 'Test image added'
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Photos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400">Uploading photos...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    Drag and drop photos here
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    or click to select files
                  </p>
                </div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                >
                  Select Files
                </Button>
                <Button
                  onClick={addTestImage}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Test Image
                </Button>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          />
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search photos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={selectAllPhotos}
            disabled={filteredPhotos.length === 0}
          >
            Select All ({filteredPhotos.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearSelection}
            disabled={selectedPhotos.length === 0}
          >
            Clear Selection
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={deleteSelectedPhotos}
            disabled={selectedPhotos.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="filter-photographer">Photographer</Label>
                <Select value={filterPhotographer} onValueChange={setFilterPhotographer}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Photographers</SelectItem>
                    <SelectItem value="empty">No Photographer</SelectItem>
                    {photographers.map(p => (
                      <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filter-brand">Brand</Label>
                <Select value={filterBrand} onValueChange={setFilterBrand}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    <SelectItem value="empty">No Brand</SelectItem>
                    {brands.map(b => (
                      <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filter-scheduled">Schedule Status</Label>
                <Select value={filterScheduled} onValueChange={setFilterScheduled}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Photos</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="unscheduled">Unscheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterPhotographer('all')
                  setFilterBrand('all')
                  setFilterScheduled('all')
                  setSearchTerm('')
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {selectedPhotos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions ({selectedPhotos.length} selected)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="quick-photographer">Photographer</Label>
                <Input
                  id="quick-photographer"
                  value={quickPhotographer}
                  onChange={(e) => setQuickPhotographer(e.target.value)}
                  list="photographers-list"
                />
                <datalist id="photographers-list">
                  {photographers.map(p => (
                    <option key={p.id} value={p.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <Label htmlFor="quick-brands">Brands (comma-separated)</Label>
                <Input
                  id="quick-brands"
                  value={quickBrands}
                  onChange={(e) => setQuickBrands(e.target.value)}
                  placeholder="Brand1, Brand2"
                />
              </div>

              <div>
                <Label htmlFor="quick-priority">Priority</Label>
                <Select value={quickPriority} onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH') => setQuickPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quick-date">Scheduled Date</Label>
                <Input
                  id="quick-date"
                  type="date"
                  value={quickDate}
                  onChange={(e) => setQuickDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="quick-time">Scheduled Time</Label>
                <Input
                  id="quick-time"
                  type="time"
                  value={quickTime}
                  onChange={(e) => setQuickTime(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="quick-location">Location</Label>
                <Input
                  id="quick-location"
                  value={quickLocation}
                  onChange={(e) => setQuickLocation(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="quick-description">Description</Label>
                <Textarea
                  id="quick-description"
                  value={quickDescription}
                  onChange={(e) => setQuickDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="quick-hashtags">Hashtags</Label>
                <Textarea
                  id="quick-hashtags"
                  value={quickHashtags}
                  onChange={(e) => setQuickHashtags(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button onClick={applyQuickActions}>
                Apply to Selected Photos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Actions */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
        <Button variant="outline" onClick={copyHTMLTable}>
          <Copy className="h-4 w-4 mr-2" />
          Copy HTML Table
        </Button>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
              selectedPhotos.includes(photo.id)
                ? 'border-indigo-500 ring-2 ring-indigo-200'
                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
            }`}
            onClick={() => togglePhotoSelection(photo.id)}
            onDoubleClick={() => setEditingPhoto(photo)}
          >
            <div className="aspect-square relative">
              <img
                src={photo.thumbnail || photo.originalUrl}
                alt={photo.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.backgroundColor = '#f3f4f6'
                  target.style.display = 'none'
                }}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Checkbox
                    checked={selectedPhotos.includes(photo.id)}
                    className="h-6 w-6 bg-white"
                  />
                </div>
              </div>

              {/* Badges */}
              <div className="absolute top-2 left-2 space-y-1">
                {!photo.photographer && !photo.brands.length && (
                  <Badge variant="secondary" className="text-xs">New</Badge>
                )}
                {photo.scheduledDate && (
                  <Badge variant="default" className="text-xs">Scheduled</Badge>
                )}
                {photo.priority === 'HIGH' && (
                  <Badge variant="destructive" className="text-xs">High</Badge>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="p-2 bg-white dark:bg-gray-800">
              <p className="text-sm font-medium truncate">{photo.name}</p>
              {photo.photographer && (
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {photo.photographer}
                </p>
              )}
              {photo.brands.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {photo.brands.slice(0, 2).map((brand, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {brand}
                    </Badge>
                  ))}
                  {photo.brands.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{photo.brands.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredPhotos.length === 0 && (
        <div className="text-center py-12">
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-white">No photos found</p>
          <p className="text-gray-600 dark:text-gray-400">
            {photos.length === 0 ? 'Upload some photos to get started' : 'Try adjusting your filters'}
          </p>
        </div>
      )}

      {/* Photo Edit Modal */}
      {editingPhoto && (
        <PhotoEditModal
          photo={editingPhoto}
          photographers={photographers}
          brands={brands}
          onSave={(updatedPhoto) => {
            const updatedPhotos = photos.map(p => 
              p.id === updatedPhoto.id ? updatedPhoto : p
            )
            setPhotos(updatedPhotos)
            setEditingPhoto(null)
          }}
          onClose={() => setEditingPhoto(null)}
        />
      )}
    </div>
  )
}
