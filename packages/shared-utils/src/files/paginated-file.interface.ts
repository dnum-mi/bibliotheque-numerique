import type { IPaginated } from '../pagination'
import type { IFileOutput } from './file-output.interface'

export interface IPaginatedFile extends IPaginated<IFileOutput> {}
