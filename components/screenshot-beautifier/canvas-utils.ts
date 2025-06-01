import { PatternPreset } from "./types";

/**
 * 绘制心形图案
 */
export const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y + size / 4);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4);
    ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + (size * 3) / 4, x, y + size);
    ctx.bezierCurveTo(x, y + (size * 3) / 4, x + size / 2, y + size / 2, x + size / 2, y + size / 4);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);
    ctx.fill();
};

/**
 * 绘制图案背景
 */
export const drawPattern = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    pattern: string,
    color: string,
) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#ffffff80";
    const size = 30;

    if (pattern === "hearts") {
        for (let x = 0; x < width; x += size * 2) {
            for (let y = 0; y < height; y += size * 2) {
                drawHeart(ctx, x + size, y + size, size / 3);
            }
        }
    } else if (pattern === "dots") {
        for (let x = 0; x < width; x += size) {
            for (let y = 0; y < height; y += size) {
                ctx.beginPath();
                ctx.arc(x + size / 2, y + size / 2, size / 6, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    } else if (pattern === "stripes") {
        for (let x = 0; x < width; x += size) {
            ctx.fillRect(x, 0, size / 2, height);
        }
    } else if (pattern === "grid") {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#ffffff40";
        for (let x = 0; x < width; x += size) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += size) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }
};

/**
 * 绘制浏览器Chrome
 */
export const drawBrowserChrome = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    style: string,
    borderRadius: number,
) => {
    const chromeHeight = 60;

    // 绘制带圆角的浏览器背景
    ctx.fillStyle = style === "safari" ? "#f6f6f6" : "#e8eaed";
    ctx.beginPath();
    ctx.roundRect(x, y, width, chromeHeight, [borderRadius, borderRadius, 0, 0]);
    ctx.fill();

    // 控制按钮
    const buttonY = y + 20;
    const buttonSize = 16;

    if (style === "safari") {
        // Safari 样式按钮
        ctx.fillStyle = "#ff5f57";
        ctx.beginPath();
        ctx.arc(x + 20, buttonY, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffbd2e";
        ctx.beginPath();
        ctx.arc(x + 44, buttonY, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#28ca42";
        ctx.beginPath();
        ctx.arc(x + 68, buttonY, 8, 0, Math.PI * 2);
        ctx.fill();
    } else {
        // Chrome 样式按钮
        ctx.fillStyle = "#ff5f57";
        ctx.beginPath();
        ctx.arc(x + 20, buttonY, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffbd2e";
        ctx.beginPath();
        ctx.arc(x + 44, buttonY, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#28ca42";
        ctx.beginPath();
        ctx.arc(x + 68, buttonY, 8, 0, Math.PI * 2);
        ctx.fill();
    }

    // 地址栏
    const addressBarX = x + 100;
    const addressBarY = y + 12;
    const addressBarWidth = width - 200;
    const addressBarHeight = 36;

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(addressBarX, addressBarY, addressBarWidth, addressBarHeight, 6);
    ctx.fill();

    ctx.strokeStyle = "#dadce0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(addressBarX, addressBarY, addressBarWidth, addressBarHeight, 6);
    ctx.stroke();

    // 地址栏文本
    ctx.fillStyle = "#5f6368";
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText("https://example.com", addressBarX + 12, addressBarY + 24);

    return chromeHeight;
}; 