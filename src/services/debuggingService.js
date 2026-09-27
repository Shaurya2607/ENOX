import { api } from './api';

class DebuggingService {
  async getDebugContext(issueId = 'ISSUE-9421') {
    return api.get(`/debugging/context?issueId=${issueId}`);
  }

  async analyzeError(context) {
    return api.post('/debugging/analyze', context);
  }

  async generateFix(issueId = 'ISSUE-9421') {
    return api.post('/debugging/generate-fix', { issueId });
  }

  async applyFix(issueId = 'ISSUE-9421') {
    return api.post('/debugging/apply-fix', { issueId });
  }

  async isFixApplied(issueId = 'ISSUE-9421') {
    const res = await api.get(
      `/debugging/fix-applied?issueId=${issueId}`
    );

    return res.applied;
  }

  async askEnox(question, context) {
    const res = await api.post('/debugging/ask', {
      question: question?.trim(),
      context,
    });

    const answer =
      typeof res === 'string'
        ? res
        : res?.answer ||
          res?.response ||
          res?.message ||
          res?.data?.answer;

    if (!answer) {
      throw new Error(
        'ENOX returned an empty response.'
      );
    }

    return answer;
  }
}

export const debuggingService =
  new DebuggingService();