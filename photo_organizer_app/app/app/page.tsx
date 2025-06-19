
'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, Calendar, Database, Settings } from 'lucide-react'
import { PhotoOrganizer } from '@/components/photo-organizer'
import { PhotoCalendar } from '@/components/photo-calendar'
import { PhotoDatabase } from '@/components/photo-database'
import { ThumbnailDiagnostic } from '@/components/thumbnail-diagnostic'
import { useToast } from '@/hooks/use-toast'

export interface Photo {
  id: string
  name: string
  originalUrl: string
  thumbnail?: string
  size: number
  type: string
  photographer?: string
  brands: string[]
  description?: string
  hashtags?: string
  location?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  scheduledDate?: Date
  scheduledTime?: string
  createdAt: Date
  updatedAt: Date
}

export interface Photographer {
  id: string
  name: string
}

export interface Brand {
  id: string
  name: string
}

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [photographers, setPhotographers] = useState<Photographer[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('organizer')
  const { toast } = useToast()

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedPhotos = localStorage.getItem('photo-organizer-photos')
      const savedPhotographers = localStorage.getItem('photo-organizer-photographers')
      const savedBrands = localStorage.getItem('photo-organizer-brands')

      if (savedPhotos) {
        const parsedPhotos = JSON.parse(savedPhotos)
        // Convert date strings back to Date objects
        const photosWithDates = parsedPhotos.map((photo: any) => ({
          ...photo,
          createdAt: new Date(photo.createdAt),
          updatedAt: new Date(photo.updatedAt),
          scheduledDate: photo.scheduledDate ? new Date(photo.scheduledDate) : undefined
        }))
        setPhotos(photosWithDates)
      }

      if (savedPhotographers) {
        setPhotographers(JSON.parse(savedPhotographers))
      }

      if (savedBrands) {
        setBrands(JSON.parse(savedBrands))
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error)
      toast({
        title: 'Error',
        description: 'Failed to load saved data',
        variant: 'destructive'
      })
    }
  }, [toast])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('photo-organizer-photos', JSON.stringify(photos))
    } catch (error) {
      console.error('Error saving photos to localStorage:', error)
    }
  }, [photos])

  useEffect(() => {
    try {
      localStorage.setItem('photo-organizer-photographers', JSON.stringify(photographers))
    } catch (error) {
      console.error('Error saving photographers to localStorage:', error)
    }
  }, [photographers])

  useEffect(() => {
    try {
      localStorage.setItem('photo-organizer-brands', JSON.stringify(brands))
    } catch (error) {
      console.error('Error saving brands to localStorage:', error)
    }
  }, [brands])

  // Statistics
  const totalPhotos = photos.length
  const taggedPhotos = photos.filter(p => p.photographer || p.brands.length > 0).length
  const scheduledPhotos = photos.filter(p => p.scheduledDate).length
  const selectedCount = selectedPhotos.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Photo Organizer Ultimate
            <span className="text-2xl font-normal text-indigo-600 dark:text-indigo-400 ml-2">
              Beltrán Edition
            </span>
          </h1>
          
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Camera className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Photos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPhotos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center">
                    <span className="text-xs">T</span>
                  </Badge>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tagged</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{taggedPhotos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{scheduledPhotos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 bg-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">S</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Selected</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="organizer" className="flex items-center space-x-2">
              <Camera className="h-4 w-4" />
              <span>Organizer</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Database</span>
            </TabsTrigger>
            <TabsTrigger value="diagnostic" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Diagnostic</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="organizer">
            <PhotoOrganizer
              photos={photos}
              setPhotos={setPhotos}
              photographers={photographers}
              brands={brands}
              selectedPhotos={selectedPhotos}
              setSelectedPhotos={setSelectedPhotos}
            />
          </TabsContent>

          <TabsContent value="calendar">
            <PhotoCalendar
              photos={photos}
              setPhotos={setPhotos}
            />
          </TabsContent>

          <TabsContent value="database">
            <PhotoDatabase
              photographers={photographers}
              setPhotographers={setPhotographers}
              brands={brands}
              setBrands={setBrands}
            />
          </TabsContent>

          <TabsContent value="diagnostic">
            <ThumbnailDiagnostic />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
