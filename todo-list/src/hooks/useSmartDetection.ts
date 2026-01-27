import { useMemo } from 'react';

export interface SmartDetectionResult {
    isActionable: boolean;
    suggestedTitle: string;
    suggestedDate: Date | null;
    confidence: number;
    type: 'task' | 'meeting' | null;
}

export function useSmartDetection() {

    const analyzeMessage = (text: string): SmartDetectionResult => {
        if (!text) return { isActionable: false, suggestedTitle: '', suggestedDate: null, confidence: 0, type: null };

        const lowerText = text.toLowerCase();
        let confidence = 0;
        let type: 'task' | 'meeting' | null = null;
        let suggestedTitle = text; // Default to full text
        let suggestedDate: Date | null = null;

        // 1. Keyword Detection (Task)
        const taskKeywords = ['buatkan task', 'create task', 'tolong', 'please', 'ingatkan', 'remind', 'jangan lupa', 'don\'t forget'];
        const taskMatch = taskKeywords.some(keyword => lowerText.includes(keyword));

        if (taskMatch) {
            confidence += 0.6;
            type = 'task';
        }

        // 2. Keyword Detection (Meeting)
        const meetingKeywords = ['meeting', 'rapat', 'ketemu', 'schedule', 'jadwalkan'];
        const meetingMatch = meetingKeywords.some(keyword => lowerText.includes(keyword));

        if (meetingMatch) {
            confidence += 0.6;
            type = 'meeting'; // Meeting implies task too usually
        }

        // 3. Time Detection (Simple Heuristics)
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (lowerText.includes('besok') || lowerText.includes('tomorrow')) {
            suggestedDate = tomorrow;
            confidence += 0.2;
        } else if (lowerText.includes('hari ini') || lowerText.includes('today')) {
            suggestedDate = today;
            confidence += 0.1;
        }

        // 4. Extraction Logic (Simplified)
        // Remove keywords to clean up title
        const allKeywords = [...taskKeywords, ...meetingKeywords, 'besok', 'tomorrow', 'hari ini', 'today'];
        let cleanTitle = text;

        // Simple regex to remove command phrases at start
        // e.g. "Tolong buatkan laporan" -> "buatkan laporan" -> "laporan"?
        // Let's just strip the exact keywords found from the start if possible, or keep it simple.

        return {
            isActionable: confidence >= 0.6,
            suggestedTitle: cleanTitle,
            suggestedDate,
            confidence,
            type
        };
    };

    return { analyzeMessage };
}
