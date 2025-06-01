export interface ImageSettings {
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

export const defaultSettings: ImageSettings = {
    borderRadius: 12,
    padding: 100,
    backgroundColor: "#f0f0f0",
    backgroundType: "solid",
    gradientStart: "#667eea",
    gradientEnd: "#764ba2",
    scale: 1.4,
    browserStyle: "none",
    shadow: 20,
    shadowColor: "#00000060",
    wallpaperUrl: "",
}

export interface GradientPreset {
    name: string
    start: string
    end: string
}

export interface ColorPreset {
    name: string
    color: string
}

export interface PatternPreset {
    name: string
    pattern: string
    color: string
}

export interface WallpaperPreset {
    name: string
    url: string
    thumbnail: string
}

export const gradientPresets: GradientPreset[] = [
    { name: "蓝紫", start: "#667eea", end: "#764ba2" },
    { name: "粉橙", start: "#f093fb", end: "#f5576c" },
    { name: "绿蓝", start: "#4facfe", end: "#00f2fe" },
    { name: "紫粉", start: "#a8edea", end: "#fed6e3" },
    { name: "橙红", start: "#ff9a9e", end: "#fecfef" },
]

export const solidColorPresets: ColorPreset[] = [
    { name: "浅灰", color: "#f8f9fa" },
    { name: "深灰", color: "#343a40" },
    { name: "蓝色", color: "#007bff" },
    { name: "绿色", color: "#28a745" },
    { name: "紫色", color: "#6f42c1" },
    { name: "粉色", color: "#e83e8c" },
    { name: "橙色", color: "#fd7e14" },
    { name: "青色", color: "#20c997" },
]

export const patternPresets: PatternPreset[] = [
    { name: "心形", pattern: "hearts", color: "#a8d8f0" },
    { name: "圆点", pattern: "dots", color: "#ffd6cc" },
    { name: "条纹", pattern: "stripes", color: "#e8f5e8" },
    { name: "网格", pattern: "grid", color: "#f0e6ff" },
]

export const wallpaperPresets: WallpaperPreset[] = [
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