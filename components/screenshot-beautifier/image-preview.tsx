"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Download, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ImagePreviewProps {
  image: HTMLImageElement | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onImageSelect: (img: HTMLImageElement | null) => void;
  triggerFileSelection: () => void;
}

export const ImagePreview = ({
  image,
  canvasRef,
  onImageSelect,
  triggerFileSelection,
}: ImagePreviewProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0].type.startsWith("image/")) {
        const img = new Image();
        img.onload = () => onImageSelect(img);
        img.src = URL.createObjectURL(files[0]);
      }
    },
    [onImageSelect]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const img = new Image();
      img.onload = () => onImageSelect(img);
      img.src = URL.createObjectURL(file);

      // Reset the file input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast({
        title: "图片已更新 ✨",
        description: "已重新选择图片进行美化",
      });
    }
  };

  const downloadImage = () => {
    if (!canvasRef.current) return;

    const link = document.createElement("a");
    link.download = "beautified-screenshot.png";
    link.href = canvasRef.current.toDataURL();
    link.click();

    toast({
      title: "下载成功 🎉",
      description: "美化后的截图已保存",
    });
  };

  const copyToClipboard = async () => {
    if (!canvasRef.current) return;

    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvasRef.current!.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("无法创建图片Blob"));
          }
        }, "image/png");
      });

      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);

      // 显示成功通知
      toast({
        title: "复制成功 📋",
        description: "图片已复制到剪切板，可以直接粘贴使用",
        variant: "default",
        duration: 2000,
      });

      // 添加视觉反馈
      const copyButton = document.querySelector('[data-copy-button="true"]');
      if (copyButton) {
        copyButton.classList.add('bg-green-100');
        setTimeout(() => {
          copyButton.classList.remove('bg-green-100');
        }, 1000);
      }
    } catch (error) {
      console.error("复制失败:", error);

      toast({
        title: "复制失败",
        description: "请尝试使用下载功能",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <>
      {!image ? (
        <Card
          className={`border-2 border-dashed transition-all duration-300 bg-white/70 backdrop-blur-sm ${
            isDragging
              ? "border-orange-400 bg-orange-50/70 scale-105"
              : "border-gray-300 hover:border-orange-300"
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
              key="file-input"
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            {/* Canvas Container with Click Handler */}
            <div
              className="flex justify-center mb-4 cursor-pointer"
              onClick={triggerFileSelection}
              style={{ position: "relative" }}
            >
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto rounded-lg"
                style={{ maxHeight: "500px" }}
              />
              <div
                className="absolute inset-0 hover:bg-black/10 rounded-lg transition-colors"
                title="点击重新选择图片"
              />
            </div>

            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="bg-white/80 hover:bg-white transition-colors"
                data-copy-button="true"
              >
                <Copy className="w-4 h-4 mr-2" />
                复制
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadImage}
                className="bg-white/80 hover:bg-white"
              >
                <Download className="w-4 h-4 mr-2" />
                下载
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={triggerFileSelection}
                className="bg-white/80 hover:bg-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                重新选择
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}; 