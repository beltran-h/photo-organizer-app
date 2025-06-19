
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

interface TestImage {
  id: string
  name: string
  method: string
  url: string
  status: 'loading' | 'success' | 'error'
  size?: string
}

export function ThumbnailDiagnostic() {
  const [testImages, setTestImages] = useState<TestImage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const generateTestImages = async () => {
    setIsGenerating(true)
    const newTestImages: TestImage[] = []

    try {
      // Method 1: Canvas-generated image with toDataURL
      const canvas1 = document.createElement('canvas')
      canvas1.width = 200
      canvas1.height = 150
      const ctx1 = canvas1.getContext('2d')
      if (ctx1) {
        const gradient = ctx1.createLinearGradient(0, 0, 200, 150)
        gradient.addColorStop(0, '#ff6b6b')
        gradient.addColorStop(1, '#4ecdc4')
        ctx1.fillStyle = gradient
        ctx1.fillRect(0, 0, 200, 150)
        ctx1.fillStyle = 'white'
        ctx1.font = '16px Arial'
        ctx1.textAlign = 'center'
        ctx1.fillText('Canvas Method 1', 100, 75)
        ctx1.fillText('toDataURL', 100, 95)
        
        newTestImages.push({
          id: 'canvas1',
          name: 'Canvas toDataURL',
          method: 'canvas.toDataURL("image/png")',
          url: canvas1.toDataURL('image/png'),
          status: 'loading'
        })
      }

      // Method 2: Canvas-generated image with toBlob
      const canvas2 = document.createElement('canvas')
      canvas2.width = 200
      canvas2.height = 150
      const ctx2 = canvas2.getContext('2d')
      if (ctx2) {
        const gradient = ctx2.createLinearGradient(0, 0, 200, 150)
        gradient.addColorStop(0, '#667eea')
        gradient.addColorStop(1, '#764ba2')
        ctx2.fillStyle = gradient
        ctx2.fillRect(0, 0, 200, 150)
        ctx2.fillStyle = 'white'
        ctx2.font = '16px Arial'
        ctx2.textAlign = 'center'
        ctx2.fillText('Canvas Method 2', 100, 75)
        ctx2.fillText('toBlob + URL', 100, 95)
        
        canvas2.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            setTestImages(prev => prev.map(img => 
              img.id === 'canvas2' 
                ? { ...img, url, size: `${blob.size} bytes` }
                : img
            ))
          }
        })
        
        newTestImages.push({
          id: 'canvas2',
          name: 'Canvas toBlob + URL',
          method: 'canvas.toBlob() + URL.createObjectURL()',
          url: '',
          status: 'loading'
        })
      }

      // Method 3: SVG Data URL
      const svgData = `
        <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#f093fb;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#f5576c;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="200" height="150" fill="url(#grad)" />
          <text x="100" y="75" font-family="Arial" font-size="16" fill="white" text-anchor="middle">SVG Method</text>
          <text x="100" y="95" font-family="Arial" font-size="16" fill="white" text-anchor="middle">Data URL</text>
        </svg>
      `
      const svgUrl = `data:image/svg+xml;base64,${btoa(svgData)}`
      
      newTestImages.push({
        id: 'svg',
        name: 'SVG Data URL',
        method: 'data:image/svg+xml;base64,...',
        url: svgUrl,
        status: 'loading'
      })

      // Method 4: Programmatic image generation
      const canvas3 = document.createElement('canvas')
      canvas3.width = 200
      canvas3.height = 150
      const ctx3 = canvas3.getContext('2d')
      if (ctx3) {
        // Create a pattern
        ctx3.fillStyle = '#ffecd2'
        ctx3.fillRect(0, 0, 200, 150)
        
        // Add some shapes
        ctx3.fillStyle = '#fcb69f'
        for (let i = 0; i < 10; i++) {
          ctx3.beginPath()
          ctx3.arc(
            Math.random() * 200,
            Math.random() * 150,
            Math.random() * 20 + 5,
            0,
            2 * Math.PI
          )
          ctx3.fill()
        }
        
        ctx3.fillStyle = 'white'
        ctx3.font = '16px Arial'
        ctx3.textAlign = 'center'
        ctx3.fillText('Generated Pattern', 100, 75)
        ctx3.fillText('Random Circles', 100, 95)
        
        newTestImages.push({
          id: 'pattern',
          name: 'Generated Pattern',
          method: 'Programmatic canvas drawing',
          url: canvas3.toDataURL('image/jpeg', 0.8),
          status: 'loading'
        })
      }

      setTestImages(newTestImages)
    } catch (error) {
      console.error('Error generating test images:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const updateImageStatus = (id: string, status: 'success' | 'error') => {
    setTestImages(prev => prev.map(img => 
      img.id === id ? { ...img, status } : img
    ))
  }

  const clearTests = () => {
    // Clean up object URLs
    testImages.forEach(img => {
      if (img.url.startsWith('blob:')) {
        URL.revokeObjectURL(img.url)
      }
    })
    setTestImages([])
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'loading':
        return <Badge variant="secondary">Loading</Badge>
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>Thumbnail Generation Diagnostic</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This diagnostic tool tests different methods of generating and displaying thumbnails 
              to identify the most reliable approach for the photo organizer.
            </p>
            
            <div className="flex space-x-2">
              <Button 
                onClick={generateTestImages}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Generate Test Images
              </Button>
              
              <Button 
                variant="outline" 
                onClick={clearTests}
                disabled={testImages.length === 0}
              >
                Clear Tests
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {testImages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testImages.map((testImage) => (
            <Card key={testImage.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>{testImage.name}</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(testImage.status)}
                    {getStatusBadge(testImage.status)}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Method:
                  </p>
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded block">
                    {testImage.method}
                  </code>
                </div>

                {testImage.size && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Size: {testImage.size}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preview:
                  </p>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                    {testImage.url ? (
                      <img
                        src={testImage.url}
                        alt={testImage.name}
                        className="max-w-full h-auto rounded"
                        onLoad={() => updateImageStatus(testImage.id, 'success')}
                        onError={() => updateImageStatus(testImage.id, 'error')}
                      />
                    ) : (
                      <div className="w-48 h-36 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                        <span className="text-sm text-gray-500">Generating...</span>
                      </div>
                    )}
                  </div>
                </div>

                {testImage.url && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL Preview:
                    </p>
                    <code className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded block break-all">
                      {testImage.url.substring(0, 100)}
                      {testImage.url.length > 100 ? '...' : ''}
                    </code>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results Summary */}
      {testImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Tests:</span>
                <Badge variant="outline">{testImages.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Successful:</span>
                <Badge variant="default" className="bg-green-500">
                  {testImages.filter(img => img.status === 'success').length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Failed:</span>
                <Badge variant="destructive">
                  {testImages.filter(img => img.status === 'error').length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Loading:</span>
                <Badge variant="secondary">
                  {testImages.filter(img => img.status === 'loading').length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
