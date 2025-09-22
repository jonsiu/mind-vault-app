/**
 * Mock for PDF.js for testing purposes
 */

const mockPDFDocument = {
  numPages: 1,
  getPage: jest.fn().mockResolvedValue({
    getTextContent: jest.fn().mockResolvedValue({
      items: [{ str: 'Mock PDF text content' }]
    }),
    getViewport: jest.fn().mockReturnValue({
      height: 800,
      width: 600
    }),
    render: jest.fn().mockReturnValue({
      promise: Promise.resolve()
    })
  }),
  getMetadata: jest.fn().mockResolvedValue({
    info: {
      Title: 'Mock PDF Title',
      Author: 'Mock Author',
      Subject: 'Mock Subject',
      Keywords: 'mock, pdf, test',
      Creator: 'Mock Creator',
      Producer: 'Mock Producer',
      CreationDate: '2023-01-01',
      ModDate: '2023-01-01'
    }
  }),
  getOutline: jest.fn().mockResolvedValue([
    {
      title: 'Chapter 1',
      dest: 'chapter1',
      items: []
    }
  ]),
  destroy: jest.fn()
}

const mockPDFJS = {
  version: '3.0.0',
  GlobalWorkerOptions: {
    workerSrc: ''
  },
  getDocument: jest.fn().mockResolvedValue({
    promise: Promise.resolve(mockPDFDocument)
  })
}

module.exports = mockPDFJS
