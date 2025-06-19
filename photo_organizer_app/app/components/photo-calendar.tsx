
'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { Photo } from '@/app/page'

interface PhotoCalendarProps {
  photos: Photo[]
  setPhotos: (photos: Photo[]) => void
}

export function PhotoCalendar({ photos, setPhotos }: PhotoCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [draggedPhoto, setDraggedPhoto] = useState<Photo | null>(null)
  const { toast } = useToast()

  // Get unscheduled photos
  const unscheduledPhotos = photos.filter(photo => !photo.scheduledDate)

  // Get scheduled photos for current month
  const scheduledPhotos = photos.filter(photo => {
    if (!photo.scheduledDate) return false
    const photoDate = new Date(photo.scheduledDate)
    return photoDate.getMonth() === currentDate.getMonth() && 
           photoDate.getFullYear() === currentDate.getFullYear()
  })

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Get calendar days
  const getCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const currentDateObj = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDateObj))
      currentDateObj.setDate(currentDateObj.getDate() + 1)
    }

    return days
  }

  // Get photos for a specific date
  const getPhotosForDate = (date: Date) => {
    return scheduledPhotos.filter(photo => {
      if (!photo.scheduledDate) return false
      const photoDate = new Date(photo.scheduledDate)
      return photoDate.toDateString() === date.toDateString()
    })
  }

  // Drag and drop handlers
  const handleDragStart = (photo: Photo) => {
    setDraggedPhoto(photo)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault()
    
    if (!draggedPhoto) return

    const updatedPhotos = photos.map(photo => {
      if (photo.id === draggedPhoto.id) {
        return {
          ...photo,
          scheduledDate: date,
          updatedAt: new Date()
        }
      }
      return photo
    })

    setPhotos(updatedPhotos)
    setDraggedPhoto(null)
    
    toast({
      title: 'Success',
      description: `Photo scheduled for ${date.toLocaleDateString()}`
    })
  }

  // Remove photo from schedule
  const removeFromSchedule = (photoId: string) => {
    const updatedPhotos = photos.map(photo => {
      if (photo.id === photoId) {
        return {
          ...photo,
          scheduledDate: undefined,
          scheduledTime: undefined,
          updatedAt: new Date()
        }
      }
      return photo
    })

    setPhotos(updatedPhotos)
    toast({
      title: 'Success',
      description: 'Photo removed from schedule'
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const calendarDays = getCalendarDays()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatDate(currentDate)}
          </h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Badge variant="secondary">
            {scheduledPhotos.length} scheduled this month
          </Badge>
          <Badge variant="outline">
            {unscheduledPhotos.length} unscheduled
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Unscheduled Photos Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Unscheduled Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {unscheduledPhotos.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                    All photos are scheduled!
                  </p>
                ) : (
                  unscheduledPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      draggable
                      onDragStart={() => handleDragStart(photo)}
                      className="flex items-center space-x-3 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 cursor-move transition-colors"
                    >
                      <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
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
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{photo.name}</p>
                        {photo.photographer && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {photo.photographer}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                  const dayPhotos = getPhotosForDate(date)
                  const isCurrentMonthDay = isCurrentMonth(date)
                  const isTodayDate = isToday(date)

                  return (
                    <div
                      key={index}
                      className={`min-h-24 p-2 border rounded-lg transition-colors ${
                        isCurrentMonthDay
                          ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                          : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900'
                      } ${
                        isTodayDate
                          ? 'ring-2 ring-indigo-500 border-indigo-500'
                          : ''
                      } hover:border-indigo-300 dark:hover:border-indigo-600`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, date)}
                    >
                      {/* Date Number */}
                      <div className={`text-sm font-medium mb-1 ${
                        isCurrentMonthDay
                          ? isTodayDate
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-900 dark:text-white'
                          : 'text-gray-400 dark:text-gray-600'
                      }`}>
                        {date.getDate()}
                      </div>

                      {/* Photos */}
                      <div className="space-y-1">
                        {dayPhotos.slice(0, 3).map((photo) => (
                          <div
                            key={photo.id}
                            className="group relative"
                          >
                            <div className="flex items-center space-x-1">
                              <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
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
                              </div>
                              <span className="text-xs truncate flex-1">
                                {photo.name}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 h-4 w-4 p-0"
                                onClick={() => removeFromSchedule(photo.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}

                        {dayPhotos.length > 3 && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            +{dayPhotos.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <CalendarIcon className="h-4 w-4" />
            <span>
              Drag unscheduled photos from the sidebar to calendar dates to schedule them. 
              Click the × button on scheduled photos to remove them from the schedule.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
