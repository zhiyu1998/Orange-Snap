"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Upload, Download, Copy, RotateCcw, Heart, Plus, Link, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ImageSettings {
  borderRadius: number
  padding: number
  backgroundColor: string
  backgroundType: "solid" | "gradient" | "pattern" | "wallpaper"
  gradientStart: string
  gradientEnd: string
  scale: number
  browserStyle: "none" | "chrome" | "safari"
  shadow: number
  shadowColor: string
  wallpaperUrl: string
}

const defaultSettings: ImageSettings = {
  borderRadius: 12,
  padding: 100,
  backgroundColor: "#f0f0f0",
  backgroundType: "solid",
  gradientStart: "#667eea",
  gradientEnd: "#764ba2",
  scale: 1.4,
  browserStyle: "chrome",
  shadow: 20,
  shadowColor: "#00000060",
  wallpaperUrl: "",
}

const gradientPresets = [
  { name: "蓝紫", start: "#667eea", end: "#764ba2" },
  { name: "粉橙", start: "#f093fb", end: "#f5576c" },
  { name: "绿蓝", start: "#4facfe", end: "#00f2fe" },
  { name: "紫粉", start: "#a8edea", end: "#fed6e3" },
  { name: "橙红", start: "#ff9a9e", end: "#fecfef" },
]

const solidColorPresets = [
  { name: "浅灰", color: "#f8f9fa" },
  { name: "深灰", color: "#343a40" },
  { name: "蓝色", color: "#007bff" },
  { name: "绿色", color: "#28a745" },
  { name: "紫色", color: "#6f42c1" },
  { name: "粉色", color: "#e83e8c" },
  { name: "橙色", color: "#fd7e14" },
  { name: "青色", color: "#20c997" },
]

const patternPresets = [
  { name: "心形", pattern: "hearts", color: "#a8d8f0" },
  { name: "圆点", pattern: "dots", color: "#ffd6cc" },
  { name: "条纹", pattern: "stripes", color: "#e8f5e8" },
  { name: "网格", pattern: "grid", color: "#f0e6ff" },
]

const wallpaperPresets = [
  {
    name: "海獭",
    url: "https://cn.bing.com/th?id=OHR.KelpOtter_ZH-CN8297228161_1920x1200.jpg",
    thumbnail: "https://cn.bing.com/th?id=OHR.KelpOtter_ZH-CN8297228161_1920x1200.jpg&w=200&h=100",
  },
  {
    name: "山脉",
    url: "https://cn.bing.com/th?id=OHR.MountHamilton_ZH-CN4280549129_1920x1080.jpg",
    thumbnail: "https://cn.bing.com/th?id=OHR.MountHamilton_ZH-CN4280549129_1920x1080.jpg&w=200&h=100",
  },
  {
    name: "羚羊",
    url: "https://cn.bing.com/th?id=OHR.OrangeImpala_ZH-CN3417660107_1920x1080.jpg",
    thumbnail: "https://cn.bing.com/th?id=OHR.OrangeImpala_ZH-CN3417660107_1920x1080.jpg&w=200&h=100",
  },
  {
    name: "每日一图",
    url: "https://bing.ee123.net/img/",
    thumbnail: "https://bing.ee123.net/img/?size=400x240",
  },
  {
    name: "随机一图",
    url: "https://bing.ee123.net/img/rand",
    thumbnail: "https://bing.ee123.net/img/rand?size=400x240",
  },
]

export default function ScreenshotBeautifier() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [settings, setSettings] = useState<ImageSettings>(defaultSettings)
  const [isDragging, setIsDragging] = useState(false)
  const [customWallpaperUrl, setCustomWallpaperUrl] = useState("")
  const [wallpaperImage, setWallpaperImage] = useState<HTMLImageElement | null>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const wallpaperInputRef = useRef<HTMLInputElement>(null)
  const wallpaperContainerRef = useRef<HTMLDivElement>(null)

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile()
        if (file) {
          const img = new Image()
          img.onload = () => setImage(img)
          img.src = URL.createObjectURL(file)
          toast({
            title: "图片已添加 ✨",
            description: "开始美化您的截图吧！",
          })
        }
        break
      }
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      const img = new Image()
      img.onload = () => setImage(img)
      img.src = URL.createObjectURL(files[0])
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const img = new Image()
      img.onload = () => setImage(img)
      img.src = URL.createObjectURL(file)
    }
  }

  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file)
      setSettings((prev) => ({ ...prev, wallpaperUrl: url }))
      loadWallpaper(url)
    }
  }

  const loadWallpaper = (url: string) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => setWallpaperImage(img)
    img.onerror = () => {
      toast({
        title: "壁纸加载失败",
        description: "请检查图片地址是否正确",
        variant: "destructive",
      })
    }
    img.src = url
  }

  const handleCustomWallpaperUrl = () => {
    if (customWallpaperUrl.trim()) {
      setSettings((prev) => ({ ...prev, wallpaperUrl: customWallpaperUrl.trim() }))
      loadWallpaper(customWallpaperUrl.trim())
      setCustomWallpaperUrl("")
    }
  }

  const scrollWallpapers = (direction: "left" | "right") => {
    if (wallpaperContainerRef.current) {
      const container = wallpaperContainerRef.current
      const scrollAmount = 200 // 每次滚动的像素数

      if (direction === "left") {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" })
        setScrollPosition(Math.max(0, scrollPosition - scrollAmount))
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" })
        setScrollPosition(scrollPosition + scrollAmount)
      }
    }
  }

  const drawPattern = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    pattern: string,
    color: string,
  ) => {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = "#ffffff80"
    const size = 30

    if (pattern === "hearts") {
      for (let x = 0; x < width; x += size * 2) {
        for (let y = 0; y < height; y += size * 2) {
          drawHeart(ctx, x + size, y + size, size / 3)
        }
      }
    } else if (pattern === "dots") {
      for (let x = 0; x < width; x += size) {
        for (let y = 0; y < height; y += size) {
          ctx.beginPath()
          ctx.arc(x + size / 2, y + size / 2, size / 6, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    } else if (pattern === "stripes") {
      for (let x = 0; x < width; x += size) {
        ctx.fillRect(x, 0, size / 2, height)
      }
    } else if (pattern === "grid") {
      ctx.lineWidth = 2
      ctx.strokeStyle = "#ffffff40"
      for (let x = 0; x < width; x += size) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y < height; y += size) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
    }
  }

  const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath()
    ctx.moveTo(x, y + size / 4)
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4)
    ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + (size * 3) / 4, x, y + size)
    ctx.bezierCurveTo(x, y + (size * 3) / 4, x + size / 2, y + size / 2, x + size / 2, y + size / 4)
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4)
    ctx.fill()
  }

  const drawBrowserChrome = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    style: string,
    borderRadius: number,
  ) => {
    const chromeHeight = 60

    // 绘制带圆角的浏览器背景
    ctx.fillStyle = style === "safari" ? "#f6f6f6" : "#e8eaed"
    ctx.beginPath()
    ctx.roundRect(x, y, width, chromeHeight, [borderRadius, borderRadius, 0, 0])
    ctx.fill()

    // 控制按钮
    const buttonY = y + 20
    const buttonSize = 16

    if (style === "safari") {
      // Safari 样式按钮
      ctx.fillStyle = "#ff5f57"
      ctx.beginPath()
      ctx.arc(x + 20, buttonY, 8, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "#ffbd2e"
      ctx.beginPath()
      ctx.arc(x + 44, buttonY, 8, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "#28ca42"
      ctx.beginPath()
      ctx.arc(x + 68, buttonY, 8, 0, Math.PI * 2)
      ctx.fill()
    } else {
      // Chrome 样式按钮
      ctx.fillStyle = "#ff5f57"
      ctx.beginPath()
      ctx.arc(x + 20, buttonY, 8, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "#ffbd2e"
      ctx.beginPath()
      ctx.arc(x + 44, buttonY, 8, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "#28ca42"
      ctx.beginPath()
      ctx.arc(x + 68, buttonY, 8, 0, Math.PI * 2)
      ctx.fill()
    }

    // 地址栏
    const addressBarX = x + 100
    const addressBarY = y + 12
    const addressBarWidth = width - 200
    const addressBarHeight = 36

    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.roundRect(addressBarX, addressBarY, addressBarWidth, addressBarHeight, 6)
    ctx.fill()

    ctx.strokeStyle = "#dadce0"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(addressBarX, addressBarY, addressBarWidth, addressBarHeight, 6)
    ctx.stroke()

    // 地址栏文本
    ctx.fillStyle = "#5f6368"
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillText("https://example.com", addressBarX + 12, addressBarY + 24)

    return chromeHeight
  }

  const renderCanvas = useCallback(() => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 计算图片缩放后的尺寸
    const scaledWidth = image.width * settings.scale
    const scaledHeight = image.height * settings.scale

    // 计算浏览器chrome高度
    const chromeHeight = settings.browserStyle !== "none" ? 60 : 0

    // 计算最终画布尺寸
    const canvasWidth = scaledWidth + settings.padding * 2
    const canvasHeight = scaledHeight + chromeHeight + settings.padding * 2

    canvas.width = canvasWidth
    canvas.height = canvasHeight

    // 清空画布
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    // 绘制背景
    if (settings.backgroundType === "solid") {
      ctx.fillStyle = settings.backgroundColor
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    } else if (settings.backgroundType === "gradient") {
      const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight)
      gradient.addColorStop(0, settings.gradientStart)
      gradient.addColorStop(1, settings.gradientEnd)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    } else if (settings.backgroundType === "pattern") {
      const selectedPattern = patternPresets.find((p) => p.color === settings.backgroundColor)
      if (selectedPattern) {
        drawPattern(ctx, canvasWidth, canvasHeight, selectedPattern.pattern, selectedPattern.color)
      }
    } else if (settings.backgroundType === "wallpaper" && wallpaperImage) {
      // 绘制壁纸背景
      const scale = Math.max(canvasWidth / wallpaperImage.width, canvasHeight / wallpaperImage.height)
      const scaledWallpaperWidth = wallpaperImage.width * scale
      const scaledWallpaperHeight = wallpaperImage.height * scale
      const offsetX = (canvasWidth - scaledWallpaperWidth) / 2
      const offsetY = (canvasHeight - scaledWallpaperHeight) / 2

      ctx.drawImage(wallpaperImage, offsetX, offsetY, scaledWallpaperWidth, scaledWallpaperHeight)
    }

    // 计算图片位置
    const imageX = settings.padding
    const imageY = settings.padding + chromeHeight

    // 绘制阴影
    if (settings.shadow > 0) {
      ctx.save()
      ctx.shadowColor = settings.shadowColor
      ctx.shadowBlur = settings.shadow
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = settings.shadow / 4

      // 创建一个临时路径用于阴影
      ctx.fillStyle = "#000000"
      ctx.beginPath()
      if (settings.browserStyle !== "none") {
        // 浏览器样式的阴影
        ctx.roundRect(imageX, imageY - chromeHeight, scaledWidth, scaledHeight + chromeHeight, [
          settings.borderRadius,
          settings.borderRadius,
          settings.borderRadius,
          settings.borderRadius,
        ])
      } else {
        ctx.roundRect(imageX, imageY, scaledWidth, scaledHeight, settings.borderRadius)
      }
      ctx.fill()
      ctx.restore()
    }

    // 绘制浏览器chrome
    if (settings.browserStyle !== "none") {
      drawBrowserChrome(
        ctx,
        imageX,
        imageY - chromeHeight,
        scaledWidth,
        scaledHeight + chromeHeight,
        settings.browserStyle,
        settings.borderRadius,
      )
    }

    // 绘制图片
    ctx.save()
    ctx.beginPath()
    if (settings.browserStyle !== "none") {
      ctx.roundRect(imageX, imageY, scaledWidth, scaledHeight, [0, 0, settings.borderRadius, settings.borderRadius])
    } else {
      ctx.roundRect(imageX, imageY, scaledWidth, scaledHeight, settings.borderRadius)
    }
    ctx.clip()
    ctx.drawImage(image, imageX, imageY, scaledWidth, scaledHeight)
    ctx.restore()
  }, [image, settings, wallpaperImage])

  const downloadImage = () => {
    if (!canvasRef.current) return

    const link = document.createElement("a")
    link.download = "beautified-screenshot.png"
    link.href = canvasRef.current.toDataURL()
    link.click()

    toast({
      title: "下载成功 🎉",
      description: "美化后的截图已保存",
    })
  }

  const copyToClipboard = async () => {
    if (!canvasRef.current) return

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current!.toBlob((blob) => resolve(blob!), "image/png")
      })

      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])

      toast({
        title: "复制成功 📋",
        description: "已复制到剪切板",
      })
    } catch (error) {
      toast({
        title: "复制失败",
        description: "请尝试使用下载功能",
        variant: "destructive",
      })
    }
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    setWallpaperImage(null)
    toast({
      title: "已重置 🔄",
      description: "所有设置已恢复默认",
    })
  }

  useEffect(() => {
    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [handlePaste])

  useEffect(() => {
    renderCanvas()
  }, [renderCanvas])

  useEffect(() => {
    if (settings.wallpaperUrl) {
      loadWallpaper(settings.wallpaperUrl)
    }
  }, [settings.wallpaperUrl])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-current" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Orange Snap</h1>
          </div>
          <p className="text-gray-600">让截图变得更美 ✨</p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Preview Area */}
          <div className="lg:col-span-3">
            {!image ? (
              <Card
                className={`border-2 border-dashed transition-all duration-300 bg-white/70 backdrop-blur-sm ${
                  isDragging ? "border-orange-400 bg-orange-50/70 scale-105" : "border-gray-300 hover:border-orange-300"
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setIsDragging(true)}
                onDragLeave={() => setIsDragging(false)}
              >
                <CardContent className="flex flex-col items-center justify-center h-96 text-center p-8">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">添加截图</h3>
                  <p className="text-gray-500 mb-6">点击这里、粘贴或拖拽图片</p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
                  >
                    选择文件
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg" style={{ maxHeight: "500px" }} />
                  </div>
                  <div className="flex justify-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="bg-white/80 hover:bg-white"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      复制
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadImage} className="bg-white/80 hover:bg-white">
                      <Download className="w-4 h-4 mr-2" />
                      下载
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setImage(null)}
                      className="bg-white/80 hover:bg-white"
                    >
                      重新选择
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">设置</h3>
                  <Button variant="ghost" size="sm" onClick={resetSettings}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                {/* Background Type */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">背景类型</Label>
                  <Select
                    value={settings.backgroundType}
                    onValueChange={(value: "solid" | "gradient" | "pattern" | "wallpaper") =>
                      setSettings((prev) => ({ ...prev, backgroundType: value }))
                    }
                  >
                    <SelectTrigger className="mt-1 bg-white/80">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">纯色</SelectItem>
                      <SelectItem value="gradient">渐变</SelectItem>
                      <SelectItem value="pattern">图案</SelectItem>
                      <SelectItem value="wallpaper">壁纸</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Background Options */}
                {settings.backgroundType === "solid" && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">背景颜色</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2 mb-3">
                      {solidColorPresets.map((preset, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            setSettings((prev) => ({
                              ...prev,
                              backgroundColor: preset.color,
                            }))
                          }
                          className={`w-8 h-8 rounded-lg border-2 transition-all ${
                            settings.backgroundColor === preset.color
                              ? "border-orange-400 scale-110"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          style={{ backgroundColor: preset.color }}
                          title={preset.name}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.backgroundColor}
                        onChange={(e) => setSettings((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-12 h-8 p-0 border-0"
                      />
                      <Input
                        type="text"
                        value={settings.backgroundColor}
                        onChange={(e) => setSettings((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                        className="flex-1 h-8 text-xs"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                )}

                {settings.backgroundType === "gradient" && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">渐变预设</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 mb-3">
                      {gradientPresets.map((preset, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            setSettings((prev) => ({
                              ...prev,
                              gradientStart: preset.start,
                              gradientEnd: preset.end,
                            }))
                          }
                          className="h-8 rounded-lg border-2 border-gray-200 hover:border-gray-300 text-xs font-medium text-white"
                          style={{
                            background: `linear-gradient(45deg, ${preset.start}, ${preset.end})`,
                          }}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={settings.gradientStart}
                          onChange={(e) => setSettings((prev) => ({ ...prev, gradientStart: e.target.value }))}
                          className="w-12 h-8 p-0 border-0"
                        />
                        <Input
                          type="text"
                          value={settings.gradientStart}
                          onChange={(e) => setSettings((prev) => ({ ...prev, gradientStart: e.target.value }))}
                          className="flex-1 h-8 text-xs"
                          placeholder="起始颜色"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={settings.gradientEnd}
                          onChange={(e) => setSettings((prev) => ({ ...prev, gradientEnd: e.target.value }))}
                          className="w-12 h-8 p-0 border-0"
                        />
                        <Input
                          type="text"
                          value={settings.gradientEnd}
                          onChange={(e) => setSettings((prev) => ({ ...prev, gradientEnd: e.target.value }))}
                          className="flex-1 h-8 text-xs"
                          placeholder="结束颜色"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {settings.backgroundType === "pattern" && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">图案背景</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 mb-3">
                      {patternPresets.map((preset, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            setSettings((prev) => ({
                              ...prev,
                              backgroundColor: preset.color,
                            }))
                          }
                          className={`h-8 rounded-lg border-2 text-xs font-medium transition-all ${
                            settings.backgroundColor === preset.color
                              ? "border-orange-400 scale-105"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          style={{ backgroundColor: preset.color }}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.backgroundColor}
                        onChange={(e) => setSettings((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-12 h-8 p-0 border-0"
                      />
                      <Input
                        type="text"
                        value={settings.backgroundColor}
                        onChange={(e) => setSettings((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                        className="flex-1 h-8 text-xs"
                        placeholder="图案颜色"
                      />
                    </div>
                  </div>
                )}

                {settings.backgroundType === "wallpaper" && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">壁纸背景</Label>
                    <div className="relative mt-2 mb-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full bg-white/80"
                        onClick={() => scrollWallpapers("left")}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <div
                        ref={wallpaperContainerRef}
                        className="flex gap-2 overflow-x-auto py-1 px-8 scrollbar-hide"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                      >
                        {wallpaperPresets.map((preset, index) => (
                          <button
                            key={index}
                            onClick={() =>
                              setSettings((prev) => ({
                                ...prev,
                                wallpaperUrl: preset.url,
                              }))
                            }
                            className={`flex-shrink-0 rounded-lg border-2 transition-all overflow-hidden ${
                              settings.wallpaperUrl === preset.url
                                ? "border-orange-400 scale-105"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            style={{ width: "100px", height: "60px" }}
                          >
                            <img
                              src={preset.thumbnail || "/placeholder.svg"}
                              alt={preset.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </button>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full bg-white/80"
                        onClick={() => scrollWallpapers("right")}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={customWallpaperUrl}
                          onChange={(e) => setCustomWallpaperUrl(e.target.value)}
                          className="flex-1 h-8 text-xs"
                          placeholder="输入图片URL"
                        />
                        <Button size="sm" onClick={handleCustomWallpaperUrl} className="h-8 px-2">
                          <Link className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => wallpaperInputRef.current?.click()}
                        className="w-full h-8 text-xs"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        上传壁纸
                      </Button>
                      <input
                        ref={wallpaperInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleWallpaperUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}

                {/* Style Controls */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">圆角: {settings.borderRadius}px</Label>
                  <Slider
                    value={[settings.borderRadius]}
                    onValueChange={([value]) => setSettings((prev) => ({ ...prev, borderRadius: value }))}
                    max={50}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">内边距: {settings.padding}px</Label>
                  <Slider
                    value={[settings.padding]}
                    onValueChange={([value]) => setSettings((prev) => ({ ...prev, padding: value }))}
                    max={200}
                    step={10}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">缩放: {Math.round(settings.scale * 100)}%</Label>
                  <Slider
                    value={[settings.scale]}
                    onValueChange={([value]) => setSettings((prev) => ({ ...prev, scale: value }))}
                    min={0.1}
                    max={3}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">阴影: {settings.shadow}px</Label>
                  <Slider
                    value={[settings.shadow]}
                    onValueChange={([value]) => setSettings((prev) => ({ ...prev, shadow: value }))}
                    max={50}
                    step={1}
                    className="mt-2"
                  />
                </div>

                {/* Browser Style */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">浏览器样式</Label>
                  <Select
                    value={settings.browserStyle}
                    onValueChange={(value: "none" | "chrome" | "safari") =>
                      setSettings((prev) => ({ ...prev, browserStyle: value }))
                    }
                  >
                    <SelectTrigger className="mt-1 bg-white/80">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">无</SelectItem>
                      <SelectItem value="chrome">Chrome</SelectItem>
                      <SelectItem value="safari">Safari</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
