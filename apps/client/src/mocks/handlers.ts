import { http, HttpResponse } from 'msw'
import type { IFileOutput } from '@biblio-num/shared'

export const handlers = [
  // http.get('/api/users/me', () => {
  //   return HttpResponse.json({
  //     createdAt: '2023-12-26T09:36:40.624Z',
  //     updatedAt: '2023-12-26T09:36:40.624Z',
  //     id: 1,
  //     email: 'admin@example.com',
  //     lastname: 'sudo',
  //     firstname: 'sudo',
  //     job: null,
  //     validated: true,
  //     role: {
  //       label: 'sudo',
  //       options: {},
  //     },
  //   })
  // }),
  http.post('/api/files/list', () => {
    const files: {total: number, data: IFileOutput[]} = {
      total: 4,
      data: [
        {
          id: 1,
          byteSize: 30234432,
          createdAt: new Date('2023-11-04'),
          label: 'un-fichier.pdf',
          mimeType: 'application/pdf',
          originalLabel: 'Label original',
          sourceLabel: 'bnum',
          state: 'uploaded',
          tags: ['bar'],
          updatedAt: new Date('2023-11-04'),
          url: 'http://localhost:8080/pdf-sample.pdf',
        },
        {
          id: 2,
          byteSize: 4064789,
          createdAt: new Date('2023-11-05'),
          label: 'une-image.png',
          mimeType: 'application/msword',
          originalLabel: 'Label original',
          sourceLabel: 'bnum',
          state: 'failed',
          tags: ['bar'],
          updatedAt: new Date('2023-11-06'),
          url: 'http://localhost:8080/icons/ms-icon-310x310.docx',
        },
        {
          id: 3,
          byteSize: 5064789,
          createdAt: new Date('2023-11-10'),
          label: 'une-autre-image.png',
          mimeType: 'image/png',
          originalLabel: 'Label original',
          sourceLabel: 'ds-annotation',
          state: 'uploading',
          tags: ['bar'],
          updatedAt: new Date('2023-11-11'),
          url: 'http://localhost:8080/pdf-sample.pdf',
        },
        {
          id: 4,
          byteSize: 664789,
          createdAt: new Date('2023-11-10'),
          label: 'Image',
          mimeType: 'application/vnd.ms-excel',
          originalLabel: 'Label original',
          sourceLabel: 'rnf',
          state: 'queued',
          tags: ['bar'],
          updatedAt: new Date('2023-11-11'),
          url: 'http://localhost:8080/pdf-sample.xlsx',
        },
      ],
    }
    return HttpResponse.json(files)
  }),
]
