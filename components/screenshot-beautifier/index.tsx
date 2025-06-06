"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Github } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { defaultSettings, ImageSettings } from "./types";
import { ImagePreview } from "./image-preview";
import { SettingsPanel } from "./settings-panel";
import { CanvasRenderer } from "./canvas-renderer";

export function ScreenshotBeautifier() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [settings, setSettings] = useState<ImageSettings>(defaultSettings);
  const [wallpaperImage, setWallpaperImage] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 处理粘贴事件
  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          const img = new Image();
          img.onload = () => setImage(img);
          img.src = URL.createObjectURL(file);
          toast({
            title: "图片已添加 ✨",
            description: "开始美化您的截图吧！",
          });
        }
        break;
      }
    }
  }, []);

  // 触发文件选择
  const triggerFileSelection = useCallback(() => {
    // 创建一个新的文件输入元素动态确保它可以正常工作
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        const img = new Image();
        img.onload = () => setImage(img);
        img.src = URL.createObjectURL(file);
        
        toast({
          title: "图片已更新 ✨",
          description: "已重新选择图片进行美化",
        });
      }
    };
    // 触发点击打开文件对话框
    input.click();
  }, []);

  // 监听粘贴事件
  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  // 监听壁纸URL变更
  useEffect(() => {
    if (settings.wallpaperUrl && settings.backgroundType === "wallpaper") {
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
      img.src = settings.wallpaperUrl;
    }
  }, [settings.wallpaperUrl, settings.backgroundType]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-500 rounded-lg flex items-center justify-center">
              <img src="favicon.png" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Orange Snap</h1>
            <a 
              href="https://github.com/zhiyu1998/Orange-Snap" 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="View on GitHub"
            >
              <Github size={24} />
            </a>
          </div>
          <p className="text-gray-600">让截图变得更美 ✨</p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Preview Area */}
          <div className="lg:col-span-3">
            <ImagePreview
              image={image}
              canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
              onImageSelect={setImage}
              triggerFileSelection={triggerFileSelection}
            />
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <SettingsPanel
              settings={settings}
              setSettings={setSettings}
              wallpaperImage={wallpaperImage}
              setWallpaperImage={setWallpaperImage}
              defaultSettings={defaultSettings}
              image={image}
            />
          </div>
        </div>

        {/* Hidden Canvas Renderer */}
        <CanvasRenderer
          image={image}
          canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
          settings={settings}
          wallpaperImage={wallpaperImage}
        />
      </div>
    </div>
  );
} 