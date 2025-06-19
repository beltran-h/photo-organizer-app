
'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Trash2, Upload, Download, Plus, Users, Building } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { Photographer, Brand } from '@/app/page'

interface PhotoDatabaseProps {
  photographers: Photographer[]
  setPhotographers: (photographers: Photographer[]) => void
  brands: Brand[]
  setBrands: (brands: Brand[]) => void
}

export function PhotoDatabase({
  photographers,
  setPhotographers,
  brands,
  setBrands
}: PhotoDatabaseProps) {
  const [newPhotographer, setNewPhotographer] = useState('')
  const [newBrand, setNewBrand] = useState('')
  const photographerFileRef = useRef<HTMLInputElement>(null)
  const brandFileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Photographer functions
  const addPhotographer = () => {
    if (!newPhotographer.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a photographer name',
        variant: 'destructive'
      })
      return
    }

    if (photographers.some(p => p.name.toLowerCase() === newPhotographer.toLowerCase())) {
      toast({
        title: 'Error',
        description: 'Photographer already exists',
        variant: 'destructive'
      })
      return
    }

    const photographer: Photographer = {
      id: `photographer_${Date.now()}`,
      name: newPhotographer.trim()
    }

    setPhotographers([...photographers, photographer])
    setNewPhotographer('')
    toast({
      title: 'Success',
      description: 'Photographer added successfully'
    })
  }

  const deletePhotographer = (id: string) => {
    setPhotographers(photographers.filter(p => p.id !== id))
    toast({
      title: 'Success',
      description: 'Photographer deleted successfully'
    })
  }

  const exportPhotographersCSV = () => {
    const csvData = photographers.map(p => p.name).join('\n')
    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'photographers.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importPhotographersCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const names = text.split('\n')
          .map(name => name.trim())
          .filter(name => name.length > 0)
          .filter(name => !photographers.some(p => p.name.toLowerCase() === name.toLowerCase()))

        const newPhotographers = names.map(name => ({
          id: `photographer_${Date.now()}_${Math.random()}`,
          name
        }))

        setPhotographers([...photographers, ...newPhotographers])
        toast({
          title: 'Success',
          description: `Imported ${newPhotographers.length} photographers`
        })
      } catch (error) {
        console.error('Error importing photographers:', error)
        toast({
          title: 'Error',
          description: 'Failed to import photographers',
          variant: 'destructive'
        })
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  // Brand functions
  const addBrand = () => {
    if (!newBrand.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a brand name',
        variant: 'destructive'
      })
      return
    }

    if (brands.some(b => b.name.toLowerCase() === newBrand.toLowerCase())) {
      toast({
        title: 'Error',
        description: 'Brand already exists',
        variant: 'destructive'
      })
      return
    }

    const brand: Brand = {
      id: `brand_${Date.now()}`,
      name: newBrand.trim()
    }

    setBrands([...brands, brand])
    setNewBrand('')
    toast({
      title: 'Success',
      description: 'Brand added successfully'
    })
  }

  const deleteBrand = (id: string) => {
    setBrands(brands.filter(b => b.id !== id))
    toast({
      title: 'Success',
      description: 'Brand deleted successfully'
    })
  }

  const exportBrandsCSV = () => {
    const csvData = brands.map(b => b.name).join('\n')
    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'brands.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importBrandsCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const names = text.split('\n')
          .map(name => name.trim())
          .filter(name => name.length > 0)
          .filter(name => !brands.some(b => b.name.toLowerCase() === name.toLowerCase()))

        const newBrands = names.map(name => ({
          id: `brand_${Date.now()}_${Math.random()}`,
          name
        }))

        setBrands([...brands, ...newBrands])
        toast({
          title: 'Success',
          description: `Imported ${newBrands.length} brands`
        })
      } catch (error) {
        console.error('Error importing brands:', error)
        toast({
          title: 'Error',
          description: 'Failed to import brands',
          variant: 'destructive'
        })
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  // Load sample data
  const loadSampleData = () => {
    const samplePhotographers = [
      'Alex Rodriguez',
      'Maria Santos',
      'David Chen',
      'Sarah Johnson',
      'Carlos Mendez'
    ]

    const sampleBrands = [
      'Fashion Nova',
      'Pretty Little Thing',
      'Shein',
      'Zara',
      'H&M',
      'Nike',
      'Adidas',
      'Revolve'
    ]

    const newPhotographers = samplePhotographers
      .filter(name => !photographers.some(p => p.name.toLowerCase() === name.toLowerCase()))
      .map(name => ({
        id: `photographer_${Date.now()}_${Math.random()}`,
        name
      }))

    const newBrands = sampleBrands
      .filter(name => !brands.some(b => b.name.toLowerCase() === name.toLowerCase()))
      .map(name => ({
        id: `brand_${Date.now()}_${Math.random()}`,
        name
      }))

    setPhotographers([...photographers, ...newPhotographers])
    setBrands([...brands, ...newBrands])

    toast({
      title: 'Success',
      description: `Loaded ${newPhotographers.length} photographers and ${newBrands.length} brands`
    })
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Photographers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{photographers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Brands</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{brands.length}</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Contacts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {photographers.length + brands.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sample Data */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={loadSampleData}>
          <Plus className="h-4 w-4 mr-2" />
          Load Sample Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Photographers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Photographers</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Photographer */}
            <div className="flex space-x-2">
              <Input
                value={newPhotographer}
                onChange={(e) => setNewPhotographer(e.target.value)}
                placeholder="Enter photographer name"
                onKeyPress={(e) => e.key === 'Enter' && addPhotographer()}
              />
              <Button onClick={addPhotographer}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Import/Export */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => photographerFileRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportPhotographersCSV}
                disabled={photographers.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            <input
              ref={photographerFileRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={importPhotographersCSV}
            />

            <p className="text-xs text-gray-600 dark:text-gray-400">
              CSV format: One photographer name per line
            </p>

            {/* Photographers List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {photographers.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                  No photographers added yet
                </p>
              ) : (
                photographers.map((photographer) => (
                  <div
                    key={photographer.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <span className="text-sm font-medium">{photographer.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePhotographer(photographer.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Brands */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Brands</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Brand */}
            <div className="flex space-x-2">
              <Input
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                placeholder="Enter brand name"
                onKeyPress={(e) => e.key === 'Enter' && addBrand()}
              />
              <Button onClick={addBrand}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Import/Export */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => brandFileRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportBrandsCSV}
                disabled={brands.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            <input
              ref={brandFileRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={importBrandsCSV}
            />

            <p className="text-xs text-gray-600 dark:text-gray-400">
              CSV format: One brand name per line
            </p>

            {/* Brands List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {brands.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                  No brands added yet
                </p>
              ) : (
                brands.map((brand) => (
                  <div
                    key={brand.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <span className="text-sm font-medium">{brand.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteBrand(brand.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
