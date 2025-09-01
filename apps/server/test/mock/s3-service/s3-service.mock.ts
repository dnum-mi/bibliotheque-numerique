import * as fs from 'fs'
import * as path from 'path'
import { Stream } from 'stream'

const fileUuid = 'bfa978f1-7337-49df-ae97-40d358afe5b9'

export const s3ServiceMock = {
  getStreamedFile: jest.fn().mockImplementation((uuid) => {
    if (uuid === fileUuid) {
      return mockStream('/coucou.txt')
    }
  }),
}

export const mockStream = (filename):Stream => {
  const stream = fs.createReadStream(path.join(__dirname, filename))
  stream.on('end', () => {
    stream.close()
  })
  return stream
}
