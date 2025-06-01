"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RotateCcw, Plus, Link, ChevronLeft, ChevronRight, Settings, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  ImageSettings,
  solidColorPresets,
  gradientPresets,
  patternPresets,
  wallpaperPresets,
} from "./types";
import { ColorExtractionService } from "@/lib/color-extraction-service";

interface SettingsPanelProps {
  settings: ImageSettings;
  setSettings: React.Dispatch<React.SetStateAction<ImageSettings>>;
  wallpaperImage: HTMLImageElement | null;
  setWallpaperImage: React.Dispatch<React.SetStateAction<HTMLImageElement | null>>;
  defaultSettings: ImageSettings;
  image: HTMLImageElement | null;
}

export const SettingsPanel = ({
  settings,
  setSettings,
  wallpaperImage,
  setWallpaperImage,
  defaultSettings,
  image,
}: SettingsPanelProps) => {
  const wallpaperInputRef = useRef<HTMLInputElement>(null);
  const wallpaperContainerRef = useRef<HTMLDivElement>(null);
  const [customWallpaperUrl, setCustomWallpaperUrl] = useState("");
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isExtractingColors, setIsExtractingColors] = useState(false);
  const [aiColors, setAiColors] = useState<string[]>([]);

  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setSettings((prev) => ({ ...prev, wallpaperUrl: url }));
      loadWallpaper(url);
    }
  };

  const loadWallpaper = (url: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setWallpaperImage(img);
    img.onerror = () => {
      toast({
        title: "壁纸加载失败",
        description: "请检查图片地址是否正确",
        variant: "destructive",
      });
    };
    img.src = url;
  };

  const handleCustomWallpaperUrl = () => {
    if (customWallpaperUrl.trim()) {
      setSettings((prev) => ({ ...prev, wallpaperUrl: customWallpaperUrl.trim() }));
      loadWallpaper(customWallpaperUrl.trim());
      setCustomWallpaperUrl("");
    }
  };

  const scrollWallpapers = (direction: "left" | "right") => {
    if (wallpaperContainerRef.current) {
      const container = wallpaperContainerRef.current;
      const scrollAmount = 200; // 每次滚动的像素数

      if (direction === "left") {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
        setScrollPosition(Math.max(0, scrollPosition - scrollAmount));
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
        setScrollPosition(scrollPosition + scrollAmount);
      }
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    setWallpaperImage(null);
    toast({
      title: "已重置 🔄",
      description: "所有设置已恢复默认",
    });
  };

  const extractColorsFromImage = async () => {
    if (!image) {
      toast({
        title: "未检测到图片",
        description: "请先上传一张图片",
        variant: "destructive",
      });
      return;
    }

    setIsExtractingColors(true);
    try {
      // Convert the HTMLImageElement to a File
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(image, 0, 0);
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => 
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9)
      );
      
      // Create a file from the blob
      const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
      
      // Extract colors using the service (no need to pass API key or baseUrl)
      const service = new ColorExtractionService();
      const colors = await service.extractColors(file);
      
      setAiColors(colors);
      
      toast({
        title: "颜色提取成功 ✨",
        description: "已从图片中提取主要颜色",
      });
    } catch (error: any) {
      console.error("Error extracting colors:", error);
      toast({
        title: "颜色提取失败",
        description: error.message || "无法从图片中提取颜色",
        variant: "destructive",
      });
    } finally {
      setIsExtractingColors(false);
    }
  };

  return (
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

            {/* AI Color Extraction */}
            <div className="mb-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-700">AI提取的颜色</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={extractColorsFromImage}
                  disabled={isExtractingColors || !image}
                  className="h-7 text-xs"
                >
                  {isExtractingColors ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      <Settings className="mr-1 h-3 w-3" />
                      提取颜色
                    </>
                  )}
                </Button>
              </div>

              {aiColors.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {aiColors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          backgroundColor: color,
                        }))
                      }
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        settings.backgroundColor === color
                          ? "border-orange-400 scale-110"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              )}
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
                ></button>
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
  );
}; 