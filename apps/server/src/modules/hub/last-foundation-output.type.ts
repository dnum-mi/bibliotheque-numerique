export interface ILastFoundationOuptut {
  scroll_id: string,
  total_records: number,
  fondations: {
      id: string,
      updatedAt: string,
      hubImportedAt: string
    } []
}
