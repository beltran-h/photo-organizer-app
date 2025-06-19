
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Copy, MessageSquare, X, Wand2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { Photo } from '@/app/page'

interface CaptionBuilderModalProps {
  photo?: Photo
  onClose: () => void
}

// Beltrán's hashtag sets
const HASHTAG_SETS = {
  'Fashion and Style': {
    main: ['#BeltranStyle', '#FashionForward', '#StyleIcon', '#TrendSetter', '#FashionInspo'],
    sub: {
      'Outfit of the Day': ['#OOTD', '#OutfitInspo', '#StyleDaily', '#FashionDaily'],
      'Designer Fashion': ['#DesignerFashion', '#LuxuryStyle', '#HighFashion', '#CoutureStyle'],
      'Street Style': ['#StreetStyle', '#UrbanFashion', '#CasualChic', '#StreetWear']
    }
  },
  'Body Positivity and Modeling': {
    main: ['#BodyPositivity', '#SelfLove', '#ConfidenceIsKey', '#BeautifulInside', '#ModelLife'],
    sub: {
      'Self Love': ['#SelfLoveJourney', '#LoveYourself', '#BodyAcceptance', '#InnerBeauty'],
      'Confidence': ['#ConfidentWoman', '#OwnYourPower', '#StrongWoman', '#Empowered'],
      'Modeling': ['#ModelingLife', '#PhotoShoot', '#BehindTheScenes', '#ModelingWork']
    }
  },
  'Performance and Dance': {
    main: ['#DanceLife', '#Performance', '#ArtisticExpression', '#MovementArt', '#DancePassion'],
    sub: {
      'Dance Performance': ['#DancePerformance', '#StageLife', '#Performer', '#DanceArt'],
      'Training': ['#DanceTraining', '#PracticeTime', '#DanceClass', '#SkillBuilding'],
      'Choreography': ['#Choreography', '#DanceCreation', '#ArtisticVision', '#CreativeProcess']
    }
  },
  'Lifestyle and Personal': {
    main: ['#BeltranLife', '#LifestyleBlogger', '#PersonalJourney', '#DailyLife', '#Authentic'],
    sub: {
      'Daily Life': ['#DailyVibes', '#LifeUpdate', '#PersonalMoments', '#RealLife'],
      'Travel': ['#TravelDiaries', '#Wanderlust', '#ExploreMore', '#TravelGram'],
      'Wellness': ['#WellnessJourney', '#HealthyLiving', '#MindBodySoul', '#SelfCare']
    }
  }
}

const DAILY_HASHTAGS = {
  'Sunday': ['#SelfieSunday', '#SundayVibes', '#WeekendMood'],
  'Monday': ['#MotivationMonday', '#MondayMood', '#NewWeekNewGoals'],
  'Tuesday': ['#TummyTuesday', '#TransformationTuesday', '#TuesdayMotivation'],
  'Wednesday': ['#WisdomWednesday', '#WednesdayWisdom', '#MidweekMotivation'],
  'Thursday': ['#ThrowbackThursday', '#ThursdayThoughts', '#AlmostWeekend'],
  'Friday': ['#FlashbackFriday', '#FridayFeeling', '#WeekendReady'],
  'Saturday': ['#SelfcareSaturday', '#SaturdayVibes', '#WeekendMood']
}

const POST_STYLES = [
  'Bold & Unapologetic',
  'Sexy & Provocative',
  'Inspirational & Motivational',
  'Fun & Playful',
  'Elegant & Sophisticated',
  'Authentic & Vulnerable',
  'Custom Style'
]

const LANGUAGES = ['English', 'Spanish', 'Spanglish']

export function CaptionBuilderModal({ photo, onClose }: CaptionBuilderModalProps) {
  // Basic settings
  const [language, setLanguage] = useState('English')
  const [postStyle, setPostStyle] = useState('Bold & Unapologetic')
  const [customStyle, setCustomStyle] = useState('')

  // Brand collaboration
  const [hasBrandCollab, setHasBrandCollab] = useState('no')
  const [brandName, setBrandName] = useState('')
  const [brandHandle, setBrandHandle] = useState('')
  const [discountCode, setDiscountCode] = useState('')
  const [sponsoredTag, setSponsoredTag] = useState('#ad')

  // Content details
  const [pictureDesc, setPictureDesc] = useState('')
  const [eventName, setEventName] = useState('')
  const [venue, setVenue] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [taggedPeople, setTaggedPeople] = useState('')
  const [communityTags, setCommunityTags] = useState('')

  // Hashtags
  const [mainCategory, setMainCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [customHashtags, setCustomHashtags] = useState('')
  const [generatedHashtags, setGeneratedHashtags] = useState('')

  // Generated content
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)

  const { toast } = useToast()

  // Initialize with photo data if provided
  useEffect(() => {
    if (photo) {
      setPictureDesc(photo.description || '')
      setCity(photo.location || '')
      setCustomHashtags(photo.hashtags || '')
      if (photo.brands.length > 0) {
        setHasBrandCollab('yes')
        setBrandName(photo.brands[0])
      }
    }
  }, [photo])

  // Update hashtags when category changes
  useEffect(() => {
    if (mainCategory && HASHTAG_SETS[mainCategory as keyof typeof HASHTAG_SETS]) {
      const categoryData = HASHTAG_SETS[mainCategory as keyof typeof HASHTAG_SETS]
      let hashtags = [...categoryData.main]

      if (subCategory && categoryData.sub[subCategory as keyof typeof categoryData.sub]) {
        hashtags = [...hashtags, ...categoryData.sub[subCategory as keyof typeof categoryData.sub]]
      }

      // Add daily hashtags
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
      if (DAILY_HASHTAGS[today as keyof typeof DAILY_HASHTAGS]) {
        hashtags = [...hashtags, ...DAILY_HASHTAGS[today as keyof typeof DAILY_HASHTAGS]]
      }

      // Add custom hashtags
      if (customHashtags) {
        const customTags = customHashtags.split(/[\s,]+/).filter(tag => tag.startsWith('#'))
        hashtags = [...hashtags, ...customTags]
      }

      setGeneratedHashtags(hashtags.join(' '))
    }
  }, [mainCategory, subCategory, customHashtags])

  const generateCaption = () => {
    const prompt = `
Create an Instagram caption for Beltrán following this exact structure:

**BASIC SETTINGS:**
- Language: ${language}
- Post Style/Tone: ${postStyle === 'Custom Style' ? customStyle : postStyle}

**BRAND COLLABORATION:**
${hasBrandCollab === 'yes' ? `
- Brand: ${brandName}
- Instagram Handle: ${brandHandle}
- Discount Code: ${discountCode}
- Sponsored Tag: ${sponsoredTag}
` : '- No brand collaboration'}

**PICTURE DESCRIPTION:**
${pictureDesc}

**EVENT/LOCATION DETAILS:**
${eventName ? `- Event: ${eventName}` : ''}
${venue ? `- Venue: ${venue}` : ''}
${city ? `- City: ${city}` : ''}
${country ? `- Country: ${country}` : ''}

**TAGGED PEOPLE:**
${taggedPeople}

**COMMUNITY TAGS:**
${communityTags}

**CAPTION STRUCTURE (MANDATORY - Follow Beltrán's signature 3-part structure):**

1. **Opening Hook** (1-2 sentences that grab attention immediately)
2. **Main Content** (2-3 sentences about the photo/experience/message)
3. **Call to Action/Question** (1 sentence engaging the audience)

**FORMATTING REQUIREMENTS:**
- Use bullet points (•) as separators between sections
- Keep it authentic to Beltrán's voice
- Include emojis naturally throughout
- End with the generated hashtags

**HASHTAGS TO USE:**
${generatedHashtags}

**ADDITIONAL NOTES:**
- Make it feel personal and authentic
- Include Beltrán's confident, empowering tone
- If it's a brand collaboration, integrate it naturally
- Keep the total character count Instagram-friendly
- Use line breaks for better readability

Generate the caption now:
    `.trim()

    setGeneratedPrompt(prompt)
    setShowPrompt(true)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: 'Success',
        description: 'Copied to clipboard!'
      })
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive'
      })
    }
  }

  const getSubCategories = () => {
    if (!mainCategory || !HASHTAG_SETS[mainCategory as keyof typeof HASHTAG_SETS]) return []
    return Object.keys(HASHTAG_SETS[mainCategory as keyof typeof HASHTAG_SETS].sub)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Caption Builder - Beltrán Edition</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Basic Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(lang => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Post Style/Tone</Label>
                  <Select value={postStyle} onValueChange={setPostStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POST_STYLES.map(style => (
                        <SelectItem key={style} value={style}>{style}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {postStyle === 'Custom Style' && (
                  <div>
                    <Label>Custom Style Description</Label>
                    <Input
                      value={customStyle}
                      onChange={(e) => setCustomStyle(e.target.value)}
                      placeholder="Describe your custom style..."
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Brand Collaboration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Brand Collaboration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Is this a brand collaboration?</Label>
                  <RadioGroup value={hasBrandCollab} onValueChange={setHasBrandCollab}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="no-collab" />
                      <Label htmlFor="no-collab">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="yes-collab" />
                      <Label htmlFor="yes-collab">Yes</Label>
                    </div>
                  </RadioGroup>
                </div>

                {hasBrandCollab === 'yes' && (
                  <>
                    <div>
                      <Label>Brand Name</Label>
                      <Input
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="Enter brand name"
                      />
                    </div>

                    <div>
                      <Label>Brand Instagram Handle</Label>
                      <Input
                        value={brandHandle}
                        onChange={(e) => setBrandHandle(e.target.value)}
                        placeholder="@brandname"
                      />
                    </div>

                    <div>
                      <Label>Discount Code</Label>
                      <Input
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        placeholder="DISCOUNT20"
                      />
                    </div>

                    <div>
                      <Label>Sponsored Tag</Label>
                      <Select value={sponsoredTag} onValueChange={setSponsoredTag}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="#ad">#ad</SelectItem>
                          <SelectItem value="#sponsored">#sponsored</SelectItem>
                          <SelectItem value="#partnership">#partnership</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Picture Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Picture Description</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={pictureDesc}
                  onChange={(e) => setPictureDesc(e.target.value)}
                  placeholder="Describe what's happening in the photo..."
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Content & Category Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content & Category Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Event Name</Label>
                    <Input
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      placeholder="Event name"
                    />
                  </div>

                  <div>
                    <Label>Venue</Label>
                    <Input
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      placeholder="Venue name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <Label>Country</Label>
                    <Input
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Country"
                    />
                  </div>
                </div>

                <div>
                  <Label>Tagged People</Label>
                  <Input
                    value={taggedPeople}
                    onChange={(e) => setTaggedPeople(e.target.value)}
                    placeholder="@person1 @person2"
                  />
                </div>

                <div>
                  <Label>Community Tags</Label>
                  <Input
                    value={communityTags}
                    onChange={(e) => setCommunityTags(e.target.value)}
                    placeholder="Community or group tags"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Hashtags & Preview */}
          <div className="space-y-6">
            {/* Hashtags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hashtags Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Main Category</Label>
                  <Select value={mainCategory} onValueChange={setMainCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select main category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(HASHTAG_SETS).map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {mainCategory && (
                  <div>
                    <Label>Subcategory</Label>
                    <Select value={subCategory} onValueChange={setSubCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {getSubCategories().map(sub => (
                          <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label>Custom Hashtags</Label>
                  <Textarea
                    value={customHashtags}
                    onChange={(e) => setCustomHashtags(e.target.value)}
                    placeholder="Add your custom hashtags..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Generated Hashtags ({generatedHashtags.split(' ').filter(Boolean).length} tags)</Label>
                  <Textarea
                    value={generatedHashtags}
                    onChange={(e) => setGeneratedHashtags(e.target.value)}
                    rows={4}
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Optimal: 20-30 hashtags. Mix of popular and niche tags works best.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Generate Caption */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generate Caption</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={generateCaption} className="w-full">
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate LLM Prompt
                </Button>

                {showPrompt && (
                  <>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generatedPrompt)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Prompt
                      </Button>
                    </div>

                    <div>
                      <Label>LLM Prompt (Copy this to your AI assistant)</Label>
                      <Textarea
                        value={generatedPrompt}
                        readOnly
                        rows={12}
                        className="text-sm font-mono"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
