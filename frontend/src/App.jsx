import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose } from '@/components/ui/toast'
import { shortenURL } from '@/services/api'
import { Copy, Check, ExternalLink, Scissors } from 'lucide-react'

function HomePage() {
  const [url, setUrl] = useState('')
  const [shortUrl, setShortUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!url.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a URL",
      })
      return
    }

    setLoading(true)
    setShortUrl(null)

    try {
      const result = await shortenURL(url.trim())
      
      if (result.success) {
        setShortUrl(result.data)
        toast({
          title: "Success!",
          description: "URL shortened successfully",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to shorten URL",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!shortUrl?.short_url) return

    try {
      await navigator.clipboard.writeText(shortUrl.short_url)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Short URL copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy to clipboard",
      })
    }
  }

  const handleOpenLink = () => {
    if (shortUrl?.short_url) {
      window.open(shortUrl.short_url, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-red-50 relative overflow-hidden">
      {/* Picasso-style geometric shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Blue triangle */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 transform rotate-45 opacity-20 border-4 border-blue-700"></div>
        {/* Red square */}
        <div className="absolute top-40 right-20 w-24 h-24 bg-red-500 transform -rotate-12 opacity-25 border-4 border-red-700"></div>
        {/* Yellow circle */}
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-yellow-400 rounded-full opacity-20 border-4 border-yellow-600"></div>
        {/* Green rectangle */}
        <div className="absolute bottom-40 right-1/3 w-28 h-20 bg-green-500 transform rotate-12 opacity-20 border-4 border-green-700"></div>
        {/* Purple diamond */}
        <div className="absolute top-1/2 right-10 w-20 h-20 bg-purple-500 transform rotate-45 opacity-20 border-4 border-purple-700"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          {/* Title with Picasso style */}
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold mb-4 transform -rotate-2" style={{
              background: 'linear-gradient(45deg, #EF4444, #3B82F6, #FBBF24)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '4px 4px 0px #000',
              fontFamily: 'serif'
            }}>
              URL SHORTENER
            </h1>
            <div className="flex items-center justify-center gap-2">
              <Scissors className="w-8 h-8 text-blue-600 transform rotate-12" />
              <p className="text-xl font-semibold text-gray-800 italic transform rotate-1">
                Cut your links, create art
              </p>
              <Scissors className="w-8 h-8 text-red-600 transform -rotate-12" />
            </div>
          </div>

          <Card className="relative border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white transform rotate-1">
            {/* Decorative corner elements */}
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-400 border-2 border-black transform rotate-45"></div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 border-2 border-black transform rotate-45"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-red-500 border-2 border-black transform rotate-45"></div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 border-2 border-black transform rotate-45"></div>

            <CardHeader className="bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500 p-6 border-b-4 border-black">
              <CardTitle className="text-3xl font-black text-white drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] transform -rotate-1">
                SHORTEN YOUR URL
              </CardTitle>
              <CardDescription className="text-lg font-bold text-gray-900 mt-2 transform rotate-1">
                Transform long links into short masterpieces
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 space-y-6 bg-white">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3 relative">
                  {/* Decorative shape behind input */}
                  <div className="absolute -left-4 top-1/2 w-8 h-8 bg-yellow-400 border-2 border-black transform -rotate-12 opacity-50"></div>
                  
                  <Label 
                    htmlFor="url" 
                    className="text-xl font-bold text-gray-900 block transform -rotate-1"
                    style={{ textShadow: '2px 2px 0px #FBBF24' }}
                  >
                    ENTER YOUR URL
                  </Label>
                  <div className="relative">
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com/very/long/url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={loading}
                      required
                      className="border-4 border-black text-lg font-semibold p-4 bg-gradient-to-r from-blue-50 to-yellow-50 focus:bg-gradient-to-r focus:from-blue-100 focus:to-yellow-100 transform hover:rotate-1 transition-transform"
                      style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                    />
                    {/* Decorative corner */}
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-black transform rotate-45"></div>
                  </div>
                </div>

                <div className="relative">
                  <Button 
                    type="submit" 
                    className="w-full text-xl font-black py-6 border-4 border-black transform hover:rotate-1 hover:scale-105 transition-all relative overflow-hidden"
                    disabled={loading}
                    style={{
                      background: loading 
                        ? 'linear-gradient(135deg, #9CA3AF, #6B7280)'
                        : 'linear-gradient(135deg, #EF4444, #3B82F6, #FBBF24)',
                      boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)',
                      color: 'white',
                      textShadow: '2px 2px 0px rgba(0,0,0,0.5)'
                    }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">✂️</span>
                        CUTTING...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-3">
                        <Scissors className="w-6 h-6" />
                        SHORTEN URL
                        <Scissors className="w-6 h-6" />
                      </span>
                    )}
                    {/* Decorative shapes on button */}
                    <div className="absolute top-0 left-0 w-3 h-3 bg-white opacity-30 transform rotate-45"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-black opacity-20 transform rotate-45"></div>
                  </Button>
                </div>
              </form>

              {shortUrl && (
                <div className="mt-8 p-6 border-4 border-black bg-gradient-to-br from-yellow-50 via-blue-50 to-red-50 transform -rotate-1 relative" style={{ boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' }}>
                  {/* Decorative elements */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-500 border-2 border-black transform rotate-45"></div>
                  <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-red-500 border-2 border-black transform rotate-45"></div>
                  
                  <div className="space-y-4 relative z-10">
                    <div>
                      <Label className="text-lg font-black text-gray-900 block mb-2 transform rotate-1" style={{ textShadow: '2px 2px 0px #FBBF24' }}>
                        YOUR SHORT URL
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={shortUrl.short_url}
                          readOnly
                          className="font-mono text-sm font-bold border-4 border-black bg-white transform hover:rotate-1 transition-transform"
                          style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)' }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleCopy}
                          title="Copy to clipboard"
                          className="border-4 border-black bg-yellow-400 hover:bg-yellow-500 transform hover:rotate-12 transition-all"
                          style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)' }}
                        >
                          {copied ? (
                            <Check className="h-5 w-5 text-green-700" />
                          ) : (
                            <Copy className="h-5 w-5 text-gray-900" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleOpenLink}
                          title="Open link"
                          className="border-4 border-black bg-blue-500 hover:bg-blue-600 text-white transform hover:-rotate-12 transition-all"
                          style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)' }}
                        >
                          <ExternalLink className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm space-y-2 pt-4 border-t-2 border-black">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 border border-black transform rotate-45"></div>
                        <span className="font-bold text-gray-900">Original: </span>
                        <a
                          href={shortUrl.original_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-semibold underline break-all"
                        >
                          {shortUrl.original_url}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 border border-black transform rotate-45"></div>
                        <span className="font-bold text-gray-900">Code: </span>
                        <span className="font-mono font-black text-purple-700 bg-purple-100 px-2 py-1 border-2 border-black transform -rotate-1 inline-block">
                          {shortUrl.short_code}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-400 border border-black transform rotate-45"></div>
                        <span className="font-bold text-gray-900">Created: </span>
                        <span className="font-semibold">{new Date(shortUrl.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer with Picasso style */}
          <div className="mt-8 text-center">
            <p className="text-sm font-bold text-gray-700 transform rotate-1">
              <span className="inline-block w-4 h-4 bg-red-500 border-2 border-black transform rotate-45 mr-2"></span>
              Art meets technology
              <span className="inline-block w-4 h-4 bg-blue-500 border-2 border-black transform rotate-45 ml-2"></span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Router>
      <ToastViewport />
      {toasts.map(({ id, title, description, action, variant, ...props }) => (
        <Toast key={id} variant={variant} {...props} className="border-4 border-black">
          <div className="grid gap-1">
            {title && <ToastTitle className="font-black">{title}</ToastTitle>}
            {description && <ToastDescription className="font-semibold">{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
    </ToastProvider>
  )
}

export default App
