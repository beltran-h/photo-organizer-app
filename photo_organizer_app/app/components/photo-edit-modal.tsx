
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Save, MessageSquare, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { CaptionBuilderModal } from '@/components/caption-builder-modal'
import type { Photo, Photographer, Brand } from '@/app/page'

interface PhotoEditModalProps {
  photo: Photo
  photographers: Photographer[]
  brands: Brand[]
  onSave: (photo: Photo) => void
  onClose: () => void
}

export function PhotoEditModal({
  photo,
  photographers,
  brands,
  onSave,
  onClose
}: PhotoEditModalProps) {
  const [editedPhoto, setEditedPhoto] = useState<Photo>(photo)
  const [brandsInput, setBrandsInput] = useState(photo.brands.join(', '))
  const [showCaptionBuilder, setShowCaptionBuilder] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setEditedPhoto(photo)
    setBrandsInput(photo.brands.join(', '))
  }, [photo])

  const handleSave = () => {
    const updatedPhoto: Photo = {
      ...editedPhoto,
      brands: brandsInput.split(',').map(b => b.trim()).filter(Boolean),
      updatedAt: new Date()
    }
    
    onSave(updatedPhoto)
    toast({
      title: 'Success',
      description: 'Photo updated successfully'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return ''
    return date.toISOString().split('T')[0]
  }

  const handleDateChange = (dateString: string) => {
    setEditedPhoto({
      ...editedPhoto,
      scheduledDate: dateString ? new Date(dateString) : undefined
    })
  }

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Edit Photo</span>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Photo Preview */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={photo.thumbnail || photo.originalUrl}
                      alt={photo.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.backgroundColor = '#f3f4f6'
                        target.alt = 'Image failed to load'
                      }}
                    />
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <p className="font-medium text-sm">{photo.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {formatFileSize(photo.size)} • {photo.type}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Edit Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="photographer">Photographer</Label>
                <Input
                  id="photographer"
                  value={editedPhoto.photographer || ''}
                  onChange={(e) => setEditedPhoto({ ...editedPhoto, photographer: e.target.value })}
                  list="photographers-list"
                  placeholder="Enter photographer name"
                />
                <datalist id="photographers-list">
                  {photographers.map(p => (
                    <option key={p.id} value={p.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <Label htmlFor="brands">Brands</Label>
                <Input
                  id="brands"
                  value={brandsInput}
                  onChange={(e) => setBrandsInput(e.target.value)}
                  placeholder="Brand1, Brand2, Brand3"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {brandsInput.split(',').map(b => b.trim()).filter(Boolean).map((brand, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {brand}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduled-date">Scheduled Date</Label>
                  <Input
                    id="scheduled-date"
                    type="date"
                    value={formatDate(editedPhoto.scheduledDate)}
                    onChange={(e) => handleDateChange(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="scheduled-time">Scheduled Time</Label>
                  <Input
                    id="scheduled-time"
                    type="time"
                    value={editedPhoto.scheduledTime || ''}
                    onChange={(e) => setEditedPhoto({ ...editedPhoto, scheduledTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={editedPhoto.location || ''}
                  onChange={(e) => setEditedPhoto({ ...editedPhoto, location: e.target.value })}
                  placeholder="Enter location"
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={editedPhoto.priority} 
                  onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH') => 
                    setEditedPhoto({ ...editedPhoto, priority: value })
                  }
                >
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editedPhoto.description || ''}
                  onChange={(e) => setEditedPhoto({ ...editedPhoto, description: e.target.value })}
                  placeholder="Enter photo description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="hashtags">Hashtags</Label>
                <Textarea
                  id="hashtags"
                  value={editedPhoto.hashtags || ''}
                  onChange={(e) => setEditedPhoto({ ...editedPhoto, hashtags: e.target.value })}
                  placeholder="Enter hashtags"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCaptionBuilder(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Generate Caption
                </Button>

                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Caption Builder Modal */}
      {showCaptionBuilder && (
        <CaptionBuilderModal
          photo={editedPhoto}
          onClose={() => setShowCaptionBuilder(false)}
        />
      )}
    </>
  )
}
