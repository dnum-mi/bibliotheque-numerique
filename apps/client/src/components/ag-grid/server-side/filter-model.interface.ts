import type { DateFilterModel, ICombinedSimpleModel, NumberFilterModel, SetFilterModel, TextFilterModel } from 'ag-grid-community'

export type SimpleFilterModel = SetFilterModel | TextFilterModel | NumberFilterModel | DateFilterModel
export type FilterModel = SimpleFilterModel | ICombinedSimpleModel<SimpleFilterModel>
export type SimpleFilterModelWithoutDate = SetFilterModel | TextFilterModel | NumberFilterModel
