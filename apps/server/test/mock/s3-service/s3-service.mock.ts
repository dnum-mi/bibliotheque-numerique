import * as fs from 'fs'
import * as path from 'path'
import { Stream } from 'stream'

const fileUuid = 'bfa978f1-7337-49df-ae97-40d358afe5b9'
const fileUuidWithSpecialChars = ['bfa978f1-7337-49df-ae97-40d358afe5b3', 'bfa978f1-7337-49df-ae97-40d358afe5b4']
export const s3ServiceMock = {
  getStreamedFile: jest.fn().mockImplementation((uuid) => {
    if (uuid === fileUuid || fileUuidWithSpecialChars.includes(uuid)) {
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
