export const QueueName = {
  sync: 'sync',
  file: 'file',
}
export type QueueNameKeys = (typeof QueueName)[keyof typeof QueueName];
