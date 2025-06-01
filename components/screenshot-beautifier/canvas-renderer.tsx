"use client";

import { useCallback, useEffect } from "react";
import { ImageSettings, patternPresets } from "./types";
import { drawPattern, drawBrowserChrome } from "./canvas-utils";

interface CanvasRendererProps {
  image: HTMLImageElement | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  settings: ImageSettings;
  wallpaperImage: HTMLImageElement | null;
}

export const CanvasRenderer = ({ image, canvasRef, settings, wallpaperImage }: CanvasRendererProps) => {
  const renderCanvas = useCallback(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 计算图片缩放后的尺寸
    const scaledWidth = image.width * settings.scale;
    const scaledHeight = image.height * settings.scale;

    // 计算浏览器chrome高度
    const chromeHeight = settings.browserStyle !== "none" ? 60 : 0;

    // 计算最终画布尺寸
    const canvasWidth = scaledWidth + settings.padding * 2;
    const canvasHeight = scaledHeight + chromeHeight + settings.padding * 2;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 清空画布
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 绘制背景
    if (settings.backgroundType === "solid") {
      ctx.fillStyle = settings.backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else if (settings.backgroundType === "gradient") {
      const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
      gradient.addColorStop(0, settings.gradientStart);
      gradient.addColorStop(1, settings.gradientEnd);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else if (settings.backgroundType === "pattern") {
      const selectedPattern = patternPresets.find((p) => p.color === settings.backgroundColor);
      if (selectedPattern) {
        drawPattern(ctx, canvasWidth, canvasHeight, selectedPattern.pattern, selectedPattern.color);
      }
    } else if (settings.backgroundType === "wallpaper" && wallpaperImage) {
      // 绘制壁纸背景
      const scale = Math.max(canvasWidth / wallpaperImage.width, canvasHeight / wallpaperImage.height);
      const scaledWallpaperWidth = wallpaperImage.width * scale;
      const scaledWallpaperHeight = wallpaperImage.height * scale;
      const offsetX = (canvasWidth - scaledWallpaperWidth) / 2;
      const offsetY = (canvasHeight - scaledWallpaperHeight) / 2;

      ctx.drawImage(wallpaperImage, offsetX, offsetY, scaledWallpaperWidth, scaledWallpaperHeight);
    }

    // 计算图片位置
    const imageX = settings.padding;
    const imageY = settings.padding + chromeHeight;

    // 绘制阴影
    if (settings.shadow > 0) {
      ctx.save();
      ctx.shadowColor = settings.shadowColor;
      ctx.shadowBlur = settings.shadow;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = settings.shadow / 4;

      // 创建一个临时路径用于阴影
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      if (settings.browserStyle !== "none") {
        // 浏览器样式的阴影
        ctx.roundRect(imageX, imageY - chromeHeight, scaledWidth, scaledHeight + chromeHeight, [
          settings.borderRadius,
          settings.borderRadius,
          settings.borderRadius,
          settings.borderRadius,
        ]);
      } else {
        ctx.roundRect(imageX, imageY, scaledWidth, scaledHeight, settings.borderRadius);
      }
      ctx.fill();
      ctx.restore();
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
        settings.borderRadius
      );
    }

    // 绘制图片
    ctx.save();
    ctx.beginPath();
    if (settings.browserStyle !== "none") {
      ctx.roundRect(imageX, imageY, scaledWidth, scaledHeight, [0, 0, settings.borderRadius, settings.borderRadius]);
    } else {
      ctx.roundRect(imageX, imageY, scaledWidth, scaledHeight, settings.borderRadius);
    }
    ctx.clip();
    ctx.drawImage(image, imageX, imageY, scaledWidth, scaledHeight);
    ctx.restore();
  }, [image, settings, wallpaperImage]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  return null;
}; 