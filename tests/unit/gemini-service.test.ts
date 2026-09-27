import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.unmock('@/lib/gemini/service');

import {
  classifySystemPrompt,
  generateMockClassification,
  extractMockChecklist,
  isMockGeminiEnabled,
} from '@/lib/gemini/service';
import { complianceChecklistGenAiSchema } from '@/lib/gemini/schema';

// Mock @google/genai
const mockGenerateContent = vi.fn();
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: mockGenerateContent,
      };
    },
    Type: {
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      BOOLEAN: 'BOOLEAN',
      ARRAY: 'ARRAY',
      INTEGER: 'INTEGER',
    },
  };
});

describe('Gemini Service Integration & Two-Step Pipeline', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('Input Validation', () => {
    it('throws error when input is empty string or whitespace', async () => {
      await expect(classifySystemPrompt('')).rejects.toThrow(
        'System description must be a non-empty string.'
      );
      await expect(classifySystemPrompt('   ')).rejects.toThrow(
        'System description must be a non-empty string.'
      );
    });

    it('throws error when input is shorter than 5 characters', async () => {
      await expect(classifySystemPrompt('AI')).rejects.toThrow(
        'System description is too short. Please provide at least 5 characters detailing the system.'
      );
    });
  });

  describe('Mock Mode & Parity', () => {
    beforeEach(() => {
      process.env.MOCK_GEMINI = 'true';
    });

    it('detects mock mode is enabled when MOCK_GEMINI is set', () => {
      expect(isMockGeminiEnabled()).toBe(true);
    });

    it('classifies Unacceptable Risk correctly in mock mode', async () => {
      const result = await classifySystemPrompt(
        'Our system uses subliminal manipulation to influence user shopping choices.'
      );
      expect(result.risk_tier).toBe('Unacceptable');
      expect(result.matched_article).toContain('Article 5');
    });

    it('classifies High Risk for employment recruitment in mock mode', async () => {
      const result = await classifySystemPrompt(
        'An automated AI pipeline for screening candidate CVs and ranking resumes for hiring.'
      );
      expect(result.risk_tier).toBe('High');
      expect(result.matched_category).toContain('Employment & Workers Management');
      expect(result.matched_article).toContain('Annex III Point 4');
    });

    it('classifies Limited Risk for conversational chatbot in mock mode', async () => {
      const result = await classifySystemPrompt(
        'A customer support conversational chatbot for our e-commerce store answering FAQs.'
      );
      expect(result.risk_tier).toBe('Limited');
      expect(result.matched_article).toContain('Article 50(1)');
    });

    it('classifies Minimal Risk for general inventory management in mock mode', async () => {
      const result = await classifySystemPrompt(
        'An inventory management optimization tool forecasting warehouse stock levels using statistical models.'
      );
      expect(result.risk_tier).toBe('Minimal');
      expect(result.matched_article).toContain('Article 4');
    });

    it('extractMockChecklist maps keywords to boolean checklist keys', () => {
      const checklist = extractMockChecklist('We screen CVs and use a chatbot assistant');
      expect(checklist.annex_iii_employment_recruitment_screening).toBe(true);
      expect(checklist.article_50_conversational_chatbot).toBe(true);
      expect(checklist.article_5_social_scoring).toBe(false);
    });
  });

  describe('Live Gemini Pipeline (Two-Step Evaluation)', () => {
    beforeEach(() => {
      process.env.MOCK_GEMINI = 'false';
      process.env.GEMINI_API_KEY = 'live-test-api-key-12345';
    });

    it('extracts booleans from Gemini and evaluates deterministic result', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({
          annex_iii_employment_recruitment_screening: true,
          article_50_conversational_chatbot: false,
          article_5_social_scoring: false,
        }),
      });

      const result = await classifySystemPrompt(
        'System evaluating job applicants for technical engineering roles.'
      );

      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.config.responseSchema).toBe(complianceChecklistGenAiSchema);
      expect(callArgs.config.responseMimeType).toBe('application/json');

      expect(result.risk_tier).toBe('High');
      expect(result.matched_category).toContain('Employment & Workers Management');
      expect(result.obligations.length).toBeGreaterThanOrEqual(8);
    });

    it('handles markdown wrapped JSON responses from Gemini', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: '```json\n{"article_5_social_scoring": true}\n```',
      });

      const result = await classifySystemPrompt(
        'Platform grading citizens social credit score for privileges.'
      );

      expect(result.risk_tier).toBe('Unacceptable');
      expect(result.matched_article).toContain('Article 5(1)(c)');
    });

    it('resiliently defaults missing schema keys to false', async () => {
      // LLM only returns one key; missing keys must default safely to false
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({
          article_50_conversational_chatbot: true,
        }),
      });

      const result = await classifySystemPrompt('Customer service chatbot.');
      expect(result.risk_tier).toBe('Limited');
      expect(result.matched_article).toContain('Article 50(1)');
    });

    it('throws descriptive error on malformed JSON from Gemini', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: '{ invalid json syntax ...',
      });

      await expect(
        classifySystemPrompt('Some description of an AI system.')
      ).rejects.toThrow(/Failed to parse Gemini output as JSON/);
    });

    it('throws descriptive error on empty response from Gemini', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: '',
      });

      await expect(
        classifySystemPrompt('Some description of an AI system.')
      ).rejects.toThrow('Empty response received from Gemini API');
    });

    it('throws descriptive error when blocked by Gemini safety filters', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        candidates: [{ finishReason: 'SAFETY' }],
      });

      await expect(
        classifySystemPrompt('Some description of an AI system.')
      ).rejects.toThrow(/Analysis blocked by AI safety filters/);
    });
  });
});
