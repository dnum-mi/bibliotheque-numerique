
export const filterParamsDate = {
  comparator: (filterLocalDateAtMidnight, cellValue) => {
    if (cellValue == null) return -1
    const cellDate = new Date(cellValue)
    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
      return 0
    }
    if (cellDate < filterLocalDateAtMidnight) {
      return -1
    }
    if (cellDate > filterLocalDateAtMidnight) {
      return 1
    }
  },
  browserDatePicker: true,
}

export const filter2Apply = {
  date: {
    filter: 'agDateColumnFilter',
    filterParams: filterParamsDate,
  },
  text: {
    filter: 'agTextColumnFilter',
  },
}
