import { buildFilterQuery } from './common-search.utils'
import { DateFilterConditions } from '@biblio-num/shared'
import * as dayjs from 'dayjs'

describe('Common search utils', () => {
  describe('Text filters', () => {
    describe('Normal text filters', () => {
      it('Should build filter for "contains"', () => {
        expect(
          buildFilterQuery(
            {
              I09: {
                filterType: 'text',
                condition1: {
                  type: 'contains',
                  filter: 'to',
                },
              },
            },
            { I09: 'string' },
          ),
        ).toEqual('(("I09" ILIKE \'%to%\'))')
      })

      it('Should build filter for "notContains"', () => {
        expect(
          buildFilterQuery(
            {
              I09: {
                filterType: 'text',
                condition1: {
                  type: 'notContains',
                  filter: 'to',
                },
              },
            },
            { I09: 'string' },
          ),
        ).toEqual('(("I09" NOT ILIKE \'%to%\'))')
      })

      it('Should build filter for "startsWith"', () => {
        expect(
          buildFilterQuery(
            {
              I09: {
                filterType: 'text',
                condition1: {
                  type: 'startsWith',
                  filter: 'to',
                },
              },
            },
            { I09: 'string' },
          ),
        ).toEqual('(("I09" ILIKE \'to%\'))')
      })

      it('Should build filter for "endsWith"', () => {
        expect(
          buildFilterQuery(
            {
              I09: {
                filterType: 'text',
                condition1: {
                  type: 'endsWith',
                  filter: 'to',
                },
              },
            },
            { I09: 'string' },
          ),
        ).toEqual('(("I09" ILIKE \'%to\'))')
      })

      it('Should build filter for "blank"', () => {
        expect(
          buildFilterQuery(
            {
              I09: {
                filterType: 'text',
                condition1: {
                  type: 'blank',
                  filter: '', // Assuming 'filter' property is empty for 'blank'
                },
              },
            },
            { I09: 'string' },
          ),
        ).toEqual('(("I09" IS NULL OR "I09" = \'\'))')
      })

      it('Should build filter for "notBlank"', () => {
        expect(
          buildFilterQuery(
            {
              I09: {
                filterType: 'text',
                condition1: {
                  type: 'notBlank',
                  filter: '', // Assuming 'filter' property is empty for 'notBlank'
                },
              },
            },
            { I09: 'string' },
          ),
        ).toEqual('(("I09" IS NOT NULL OR "I09" != \'\'))')
      })
    })
    describe('Array text filters', () => {
      it('Should build filter for "contains"', () => {
        expect(
          buildFilterQuery(
            {
              I09: {
                filterType: 'text',
                condition1: {
                  type: 'contains',
                  filter: 'to',
                },
              },
            },
            { I09: 'string' },
            true,
          ),
        ).toEqual(
          '((EXISTS (SELECT 1 FROM UNNEST("I09") AS item WHERE item ILIKE \'%to%\')))',
        )
      })

      it('Should build filter for "notContains"', () => {
        expect(
          buildFilterQuery(
            {
              I09: {
                filterType: 'text',
                condition1: {
                  type: 'notContains',
                  filter: 'to',
                },
              },
            },
            { I09: 'string' },
            true,
          ),
        ).toEqual(
          '((EXISTS (SELECT 1 FROM UNNEST("I09") AS item WHERE item NOT ILIKE \'%to%\')))',
        )
      })

      it('Should build filter for "startsWith"', () => {
        expect(
          buildFilterQuery(
            {
              I09: {
                filterType: 'text',
                condition1: {
                  type: 'startsWith',
                  filter: 'to',
                },
              },
            },
            { I09: 'string' },
            true,
          ),
        ).toEqual(
          '((EXISTS (SELECT 1 FROM UNNEST("I09") AS item WHERE item ILIKE \'to%\')))',
        )
      })

      it('Should build filter for "endsWith"', () => {
        expect(
          buildFilterQuery(
            {
              I09: {
                filterType: 'text',
                condition1: {
                  type: 'endsWith',
                  filter: 'to',
                },
              },
            },
            { I09: 'string' },
            true,
          ),
        ).toEqual(
          '((EXISTS (SELECT 1 FROM UNNEST("I09") AS item WHERE item ILIKE \'%to\')))',
        )
      })

      it('Should build filter for "blank"', () => {
        expect(
          buildFilterQuery(
            {
              I09: {
                filterType: 'text',
                condition1: {
                  type: 'blank',
                  filter: '', // Assuming 'filter' property is empty for 'blank'
                },
              },
            },
            { I09: 'string' },
            true,
          ),
        ).toEqual(
          '((EXISTS (SELECT 1 FROM UNNEST("I09") AS item WHERE item IS NULL OR item = \'\')))',
        )
      })

      it('Should build filter for "notBlank"', () => {
        expect(
          buildFilterQuery(
            {
              I09: {
                filterType: 'text',
                condition1: {
                  type: 'notBlank',
                  filter: '', // Assuming 'filter' property is empty for 'notBlank'
                },
              },
            },
            { I09: 'string' },
            true,
          ),
        ).toEqual(
          '((EXISTS (SELECT 1 FROM UNNEST("I09") AS item WHERE item IS NOT NULL OR item != \'\')))',
        )
      })
    })
  })

  describe('Enum filters', () => {
    it('Should build filter for normal field', () => {
      expect(
        buildFilterQuery(
          {
            I09: {
              filterType: 'set',
              condition1: {
                filter: ['toto', 'tata'],
              },
            },
          },
          { I09: 'enum' },
        ),
      ).toEqual('(("I09" IN (\'toto\',\'tata\')))')
    })
    it('Should build filter for array field', () => {
      expect(
        buildFilterQuery(
          {
            I09: {
              filterType: 'set',
              condition1: {
                filter: ['toto'],
              },
            },
          },
          { I09: 'enum' },
          true,
        ),
      ).toEqual(
        '((EXISTS (SELECT 1 FROM UNNEST("I09") AS item WHERE item IN (\'toto\'))))',
      )
    })
  })

  describe('Date filters', () => {
    describe('Normal date filters', () => {
      it('Should build filter for date equals condition', () => {
        expect(
          buildFilterQuery(
            {
              dateField: {
                filterType: 'date',
                condition1: {
                  type: DateFilterConditions.Equals,
                  filter: '2023-01-01',
                },
              },
            },
            { dateField: 'date' },
          ),
        ).toEqual('(("dateField" = \'2023-01-01\'))')
      })

      it('Should build filter for date notEqual condition', () => {
        expect(
          buildFilterQuery(
            {
              dateField: {
                filterType: 'date',
                condition1: {
                  type: DateFilterConditions.NotEqual,
                  filter: '2023-01-01',
                },
              },
            },
            { dateField: 'date' },
          ),
        ).toEqual('(("dateField" != \'2023-01-01\'))')
      })

      it('Should build filter for date less than condition', () => {
        expect(
          buildFilterQuery(
            {
              dateField: {
                filterType: 'date',
                condition1: {
                  type: DateFilterConditions.LessThan,
                  filter: '2023-01-01',
                },
              },
            },
            { dateField: 'date' },
          ),
        ).toEqual('(("dateField" < \'2023-01-01\'))')
      })

      it('Should build filter for date notEqual condition', () => {
        expect(
          buildFilterQuery(
            {
              dateField: {
                filterType: 'date',
                condition1: {
                  type: DateFilterConditions.GreaterThan,
                  filter: '2023-01-01',
                },
              },
            },
            { dateField: 'date' },
          ),
        ).toEqual('(("dateField" > \'2023-01-01\'))')
      })

      it('Should build filter for date since condition', () => {
        const oneYearBeforeNow = dayjs().subtract(1, 'year').format()
        expect(
          buildFilterQuery(
            {
              dateField: {
                filterType: 'date',
                condition1: {
                  type: DateFilterConditions.Since,
                  sinceWhen: 'OneYear',
                },
              },
            },
            { dateField: 'date' },
          ),
        ).toEqual('(("dateField" > \'' + oneYearBeforeNow + '\'))')
      })
    })
    describe('Array date filters', () => {
      it('Should build filter for date equals condition', () => {
        expect(
          buildFilterQuery(
            {
              dateField: {
                filterType: 'date',
                condition1: {
                  type: DateFilterConditions.Equals,
                  filter: '2023-01-01',
                },
              },
            },
            { dateField: 'date' },
            true,
          ),
        ).toEqual(
          '((EXISTS (SELECT 1 FROM UNNEST("dateField") AS item WHERE item = \'2023-01-01\')))',
        )
      })

      it('Should build filter for date notEqual condition', () => {
        expect(
          buildFilterQuery(
            {
              dateField: {
                filterType: 'date',
                condition1: {
                  type: DateFilterConditions.NotEqual,
                  filter: '2023-01-01',
                },
              },
            },
            { dateField: 'date' },
            true,
          ),
        ).toEqual(
          '((EXISTS (SELECT 1 FROM UNNEST("dateField") AS item WHERE item != \'2023-01-01\')))',
        )
      })

      it('Should build filter for date less than condition', () => {
        expect(
          buildFilterQuery(
            {
              dateField: {
                filterType: 'date',
                condition1: {
                  type: DateFilterConditions.LessThan,
                  filter: '2023-01-01',
                },
              },
            },
            { dateField: 'date' },
            true,
          ),
        ).toEqual(
          '((EXISTS (SELECT 1 FROM UNNEST("dateField") AS item WHERE item < \'2023-01-01\')))',
        )
      })

      it('Should build filter for date notEqual condition', () => {
        expect(
          buildFilterQuery(
            {
              dateField: {
                filterType: 'date',
                condition1: {
                  type: DateFilterConditions.GreaterThan,
                  filter: '2023-01-01',
                },
              },
            },
            { dateField: 'date' },
            true,
          ),
        ).toEqual(
          '((EXISTS (SELECT 1 FROM UNNEST("dateField") AS item WHERE item > \'2023-01-01\')))',
        )
      })
    })
  })

  describe('Number filters', () => {
    describe('Normal number filters', () => {
      it('Should build filter for number equals condition', () => {
        expect(
          buildFilterQuery(
            {
              numberField: {
                filterType: 'number',
                condition1: {
                  type: 'equals',
                  filter: '10',
                },
              },
            },
            { numberField: 'number' },
          ),
        ).toEqual('(("numberField" = 10))')
      })

      it('Should build filter for number notEqual condition', () => {
        expect(
          buildFilterQuery(
            {
              numberField: {
                filterType: 'number',
                condition1: {
                  type: 'notEqual',
                  filter: '10',
                },
              },
            },
            { numberField: 'number' },
          ),
        ).toEqual('(("numberField" != 10))')
      })

      it('Should build filter for number lessThan condition', () => {
        expect(
          buildFilterQuery(
            {
              numberField: {
                filterType: 'number',
                condition1: {
                  type: 'lessThan',
                  filter: '5',
                },
              },
            },
            { numberField: 'number' },
          ),
        ).toEqual('(("numberField" < 5))')
      })

      it('Should build filter for number lessThanOrEqual condition', () => {
        expect(
          buildFilterQuery(
            {
              numberField: {
                filterType: 'number',
                condition1: {
                  type: 'lessThanOrEqual',
                  filter: '5',
                },
              },
            },
            { numberField: 'number' },
          ),
        ).toEqual('(("numberField" <= 5))')
      })

      it('Should build filter for number greaterThan condition', () => {
        expect(
          buildFilterQuery(
            {
              numberField: {
                filterType: 'number',
                condition1: {
                  type: 'greaterThan',
                  filter: '7',
                },
              },
            },
            { numberField: 'number' },
          ),
        ).toEqual('(("numberField" > 7))')
      })

      it('Should build filter for number greaterThanOrEqual condition', () => {
        expect(
          buildFilterQuery(
            {
              numberField: {
                filterType: 'number',
                condition1: {
                  type: 'greaterThanOrEqual',
                  filter: '8',
                },
              },
            },
            { numberField: 'number' },
          ),
        ).toEqual('(("numberField" >= 8))')
      })
    })
    describe('Array number filters', () => {
      it('Should build filter for number equals condition', () => {
        expect(
          buildFilterQuery(
            {
              numberField: {
                filterType: 'number',
                condition1: {
                  type: 'equals',
                  filter: '10',
                },
              },
            },
            { numberField: 'number' },
            true,
          ),
        ).toEqual(
          '((EXISTS (SELECT 1 FROM UNNEST("numberField") AS item WHERE item = 10)))',
        )
      })

      it('Should build filter for number notEqual condition', () => {
        expect(
          buildFilterQuery(
            {
              numberField: {
                filterType: 'number',
                condition1: {
                  type: 'notEqual',
                  filter: '10',
                },
              },
            },
            { numberField: 'number' },
            true,
          ),
        ).toEqual(
          '((EXISTS (SELECT 1 FROM UNNEST("numberField") AS item WHERE item != 10)))',
        )
      })

      it('Should build filter for number lessThan condition', () => {
        expect(
          buildFilterQuery(
            {
              numberField: {
                filterType: 'number',
                condition1: {
                  type: 'lessThan',
                  filter: '5',
                },
              },
            },
            { numberField: 'number' },
            true,
          ),
        ).toEqual(
          '((EXISTS (SELECT 1 FROM UNNEST("numberField") AS item WHERE item < 5)))',
        )
      })

      it('Should build filter for number lessThanOrEqual condition', () => {
        expect(
          buildFilterQuery(
            {
              numberField: {
                filterType: 'number',
                condition1: {
                  type: 'lessThanOrEqual',
                  filter: '5',
                },
              },
            },
            { numberField: 'number' },
            true,
          ),
        ).toEqual(
          '((EXISTS (SELECT 1 FROM UNNEST("numberField") AS item WHERE item <= 5)))',
        )
      })

      it('Should build filter for number greaterThan condition', () => {
        expect(
          buildFilterQuery(
            {
              numberField: {
                filterType: 'number',
                condition1: {
                  type: 'greaterThan',
                  filter: '7',
                },
              },
            },
            { numberField: 'number' },
            true,
          ),
        ).toEqual(
          '((EXISTS (SELECT 1 FROM UNNEST("numberField") AS item WHERE item > 7)))',
        )
      })

      it('Should build filter for number greaterThanOrEqual condition', () => {
        expect(
          buildFilterQuery(
            {
              numberField: {
                filterType: 'number',
                condition1: {
                  type: 'greaterThanOrEqual',
                  filter: '8',
                },
              },
            },
            { numberField: 'number' },
            true,
          ),
        ).toEqual(
          '((EXISTS (SELECT 1 FROM UNNEST("numberField") AS item WHERE item >= 8)))',
        )
      })
    })
  })

  describe('Combined filters', () => {
    it('Should build filter for two conditions using "AND" operator', () => {
      expect(
        buildFilterQuery(
          {
            I09: {
              filterType: 'text',
              condition1: {
                type: 'contains',
                filter: 'to',
              },
              condition2: {
                type: 'notContains',
                filter: 'ti',
              },
              operator: 'AND',
            },
          },
          { I09: 'string' },
        ),
      ).toEqual('(("I09" ILIKE \'%to%\') AND ("I09" NOT ILIKE \'%ti%\'))')
    })

    it('Should build filter for two conditions using "OR" operator', () => {
      expect(
        buildFilterQuery(
          {
            I09: {
              filterType: 'text',
              condition1: {
                type: 'startsWith',
                filter: 'to',
              },
              condition2: {
                type: 'endsWith',
                filter: 'ti',
              },
              operator: 'OR',
            },
          },
          { I09: 'string' },
        ),
      ).toEqual('(("I09" ILIKE \'to%\') OR ("I09" ILIKE \'%ti\'))')
    })

    it('Should build filter for multiple fields using "AND" operator', () => {
      expect(
        buildFilterQuery(
          {
            I09: {
              filterType: 'text',
              condition1: {
                type: 'contains',
                filter: 'to',
              },
            },
            I08: {
              filterType: 'number',
              condition1: {
                type: 'greaterThan',
                filter: 10000,
              },
              condition2: {
                type: 'greaterThan',
                filter: 20000,
              },
              operator: 'OR',
            },
          },
          {
            I09: 'string',
            I08: 'number',
          },
          true,
        ),
      ).toEqual(
        // eslint-disable-next-line max-len
        '((EXISTS (SELECT 1 FROM UNNEST("I09") AS item WHERE item ILIKE \'%to%\'))) AND ((EXISTS (SELECT 1 FROM UNNEST("I08") AS item WHERE item > 10000)) OR (EXISTS (SELECT 1 FROM UNNEST("I08") AS item WHERE item > 20000)))',
      )
    })
  })
})
