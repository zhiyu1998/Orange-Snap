/**
 * Service to extract colors from an image using AI
 */
export class ColorExtractionService {
    /**
     * Extract the main solid colors from an image
     * @param imageFile - The image file to analyze
     * @returns An array of color hex codes
     */
    async extractColors(imageFile: File): Promise<string[]> {
        return this.extractColorsByType(imageFile, 'solid');
    }

    /**
     * Extract gradient color pairs from an image
     * @param imageFile - The image file to analyze
     * @returns An array of gradient color pairs
     */
    async extractGradients(imageFile: File): Promise<Array<{ start: string, end: string }>> {
        const result = await this.extractColorsByType(imageFile, 'gradient');
        return result as Array<{ start: string, end: string }>;
    }

    /**
     * Generic method to extract colors by type
     * @param imageFile - The image file to analyze
     * @param type - The type of extraction ('solid' or 'gradient')
     * @returns Array of colors or gradient pairs
     */
    private async extractColorsByType(imageFile: File, type: 'solid' | 'gradient'): Promise<any> {
        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            const response = await fetch(`/api/extract-colors`, {
                method: 'POST',
                headers: {
                    'x-extraction-type': type
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to extract colors');
            }

            const data = await response.json();
            return data.colors;
        } catch (error: any) {
            console.error(`Error extracting ${type} colors:`, error);
            throw error;
        }
    }
} 