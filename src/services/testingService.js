import { api, apiStream } from './api';

class TestingService {
  async getTestSuite(projectId = 'proj-sentinel-iq') {
    return api.get(`/testing/suite?projectId=${projectId}`);
  }
  async runTests(projectId = 'proj-sentinel-iq', onProgress) {
    return apiStream(`/testing/run?projectId=${projectId}`, (evt) => {
      if (evt.type === 'progress' && onProgress) onProgress(evt.count, evt.total, evt.testName);
    });
  }
  async runFailedTests(projectId = 'proj-sentinel-iq', onProgress) {
    return apiStream(`/testing/run-failed?projectId=${projectId}`, (evt) => {
      if (evt.type === 'progress' && onProgress) onProgress(evt.count, evt.total, evt.testName);
    });
  }
  async generateTests(filePath) {
    return api.post('/testing/generate', { filePath });
  }
}

export const testingService = new TestingService();
