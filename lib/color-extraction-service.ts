/**
 * Service to extract colors from an image using AI
 */
export class ColorExtractionService {
    /**
     * Extract the main colors from an image
     * @param imageFile - The image file to analyze
     * @returns An array of color hex codes
     */
    async extractColors(imageFile: File): Promise<string[]> {
        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            const response = await fetch(`/api/extract-colors`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to extract colors');
            }

            const data = await response.json();
            return data.colors;
        } catch (error: any) {
            console.error('Error extracting colors:', error);
            throw error;
        }
    }
} 