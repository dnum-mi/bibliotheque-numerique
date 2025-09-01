import * as dayjs from 'dayjs'
import {
  DateFilterConditions,
  FilterDateDto,
  FilterNumberDto,
} from '@/shared/pagination/filters'
import { buildFilterQuery } from '@/shared/pagination/utils/build-filter.utils'
import { FilterNumbersDto } from '@/shared/pagination/filters/numbers.filter.dto'

describe('Build filter', () => {
  describe('Common filter', () => {
    it('Should not accept filter', async () => {
      await expect(
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
          { I09: 'number' },
        ),
      ).rejects.toThrow('Your filter does not match the schema.')
    })

    it('Should not accept filter', () => {
      expect(() =>
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
          { I09: 'enum' },
        ),
      ).rejects.toThrow('Your filter does not match the schema.')
    })

    it('Should not accept filter', () => {
      expect(() =>
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
          { I09: 'date' },
        ),
      ).rejects.toThrow('Your filter does not match the schema.')
    })

    it('Should not accept filter', () => {
      expect(() =>
        buildFilterQuery(
          {
            I09: {
              filterType: 'number',
              condition1: {
                type: 'equal',
                filter: 10,
              },
            },
          },
          { I09: 'string' },
        ),
      ).rejects.toThrow('Your filter does not match the schema.')
    })
  })

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
        ).resolves.toEqual('(("I09" ILIKE \'%to%\'))')
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
        ).resolves.toEqual('(("I09" NOT ILIKE \'%to%\'))')
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
        ).resolves.toEqual('(("I09" ILIKE \'to%\'))')
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
        ).resolves.toEqual('(("I09" ILIKE \'%to\'))')
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
        ).resolves.toEqual('(("I09" IS NULL OR "I09" = \'\'))')
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
        ).resolves.toEqual('(("I09" IS NOT NULL OR "I09" != \'\'))')
      })

      it('Should build filter for "notEqual"', () => {
        expect(
          buildFilterQuery(
            {
              I09: {
                filterType: 'text',
                condition1: {
                  type: 'notEqual',
                  filter: 'toto',
                },
              },
            },
            { I09: 'string' },
          ),
        ).resolves.toEqual('(("I09" != \'toto\'))')
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
        ).resolves.toEqual(
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
        ).resolves.toEqual(
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
        ).resolves.toEqual(
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
        ).resolves.toEqual(
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
        ).resolves.toEqual(
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
        ).resolves.toEqual(
          '((EXISTS (SELECT 1 FROM UNNEST("I09") AS item WHERE item IS NOT NULL OR item != \'\')))',
        )
      })

      it('Should build filter for "notEqual"', () => {
        expect(
          buildFilterQuery(
            {
              I09: {
                filterType: 'text',
                condition1: {
                  type: 'notEqual',
                  filter: 'toto',
                },
              },
            },
            { I09: 'string' },
            true,
          ),
        ).resolves.toEqual(
          '((EXISTS (SELECT 1 FROM UNNEST("I09") AS item WHERE item != \'toto\')))',
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
      ).resolves.toEqual("((\"I09\" IN ('toto','tata')))")
      expect(
        expect(
          buildFilterQuery(
            {
              I09: {
                filterType: 'set',
                condition1: {
                  filter: [''],
                },
              },
            },
            { I09: 'enum' },
          ),
        ).rejects.toThrow('Empty string is not a correct enum value.')
      )
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
      ).resolves.toEqual(
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
        ).resolves.toEqual('((DATE("dateField") = \'2023-01-01\'))')
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
        ).resolves.toEqual('((DATE("dateField") != \'2023-01-01\'))')
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
        ).resolves.toEqual('((DATE("dateField") < \'2023-01-01\'))')
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
        ).resolves.toEqual('((DATE("dateField") > \'2023-01-01\'))')
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
              } as FilterDateDto,
            },
            { dateField: 'date' },
          ),
        ).resolves.toEqual('((DATE("dateField") > \'' + oneYearBeforeNow + "'))")
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
        ).resolves.toEqual(
          '((EXISTS (SELECT 1 FROM UNNEST("dateField") AS item WHERE DATE(item) = \'2023-01-01\')))',
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
        ).resolves.toEqual(
          '((EXISTS (SELECT 1 FROM UNNEST("dateField") AS item WHERE DATE(item) != \'2023-01-01\')))',
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
        ).resolves.toEqual(
          '((EXISTS (SELECT 1 FROM UNNEST("dateField") AS item WHERE DATE(item) < \'2023-01-01\')))',
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
        ).resolves.toEqual(
          '((EXISTS (SELECT 1 FROM UNNEST("dateField") AS item WHERE DATE(item) > \'2023-01-01\')))',
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
                  filter: 10,
                },
              } as FilterNumberDto,
            },
            { numberField: 'number' },
          ),
        ).resolves.toEqual('(("numberField" = 10))')
      })

      it('Should build filter for number notEqual condition', () => {
        expect(
          buildFilterQuery(
            {
              numberField: {
                filterType: 'number',
                condition1: {
                  type: 'notEqual',
                  filter: 10,
                },
              } as FilterNumberDto,
            },
            { numberField: 'number' },
          ),
        ).resolves.toEqual('(("numberField" != 10))')
      })

      it('Should build filter for number lessThan condition', () => {
        expect(
          buildFilterQuery(
            {
              numberField: {
                filterType: 'number',
                condition1: {
                  type: 'lessThan',
                  filter: 5,
                },
              } as FilterNumberDto,
            },
            { numberField: 'number' },
          ),
        ).resolves.toEqual('(("numberField" < 5))')
      })

      it('Should build filter for number lessThanOrEqual condition', () => {
        expect(
          buildFilterQuery(
            {
              numberField: {
                filterType: 'number',
                condition1: {
                  type: 'lessThanOrEqual',
                  filter: 5,
                },
              } as FilterNumberDto,
            },
            { numberField: 'number' },
          ),
        ).resolves.toEqual('(("numberField" <= 5))')
      })

      it('Should build filter for number greaterThan condition', () => {
        expect(
          buildFilterQuery(
            {
              numberField: {
                filterType: 'number',
                condition1: {
                  type: 'greaterThan',
                  filter: 7,
                },
              } as FilterNumberDto,
            },
            { numberField: 'number' },
          ),
        ).resolves.toEqual('(("numberField" > 7))')
      })

      it('Should build filter for number greaterThanOrEqual condition', () => {
        expect(
          buildFilterQuery(
            {
              numberField: {
                filterType: 'number',
                condition1: {
                  type: 'greaterThanOrEqual',
                  filter: 8,
                },
              } as FilterNumberDto,
            },
            { numberField: 'number' },
          ),
        ).resolves.toEqual('(("numberField" >= 8))')
      })

      it('Should build filter for number blank condition', () => {
        expect(
          buildFilterQuery(
            {
              numberField: {
                filterType: 'number',
                condition1: {
                  type: 'blank'
                },
              } as FilterNumberDto,
            },
            { numberField: 'number' },
          ),
        ).resolves.toEqual('(("numberField" IS NULL))')
      })

      it('Should build filter for number notBlank condition', () => {
        expect(
          buildFilterQuery(
            {
              numberField: {
                filterType: 'number',
                condition1: {
                  type: 'notBlank'
                },
              } as FilterNumberDto,
            },
            { numberField: 'number' },
          ),
        ).resolves.toEqual('(("numberField" IS NOT NULL))')
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
                  filter: 10,
                },
              } as FilterNumberDto,
            },
            { numberField: 'number' },
            true,
          ),
        ).resolves.toEqual(
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
                  filter: 10,
                },
              } as FilterNumberDto,
            },
            { numberField: 'number' },
            true,
          ),
        ).resolves.toEqual(
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
                  filter: 5,
                },
              } as FilterNumberDto,
            },
            { numberField: 'number' },
            true,
          ),
        ).resolves.toEqual(
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
                  filter: 5,
                },
              } as FilterNumberDto,
            },
            { numberField: 'number' },
            true,
          ),
        ).resolves.toEqual(
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
                  filter: 7,
                },
              } as FilterNumberDto,
            },
            { numberField: 'number' },
            true,
          ),
        ).resolves.toEqual(
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
                  filter: 8,
                },
              } as FilterNumberDto,
            },
            { numberField: 'number' },
            true,
          ),
        ).resolves.toEqual(
          '((EXISTS (SELECT 1 FROM UNNEST("numberField") AS item WHERE item >= 8)))',
        )
      })

      it('Should build filter for number blank condition', () => {
        expect(
          buildFilterQuery(
            {
              numberField: {
                filterType: 'number',
                condition1: {
                  type: 'blank'
                },
              } as FilterNumberDto,
            },
            { numberField: 'number' },
            true,
          ),
        ).resolves.toEqual('((EXISTS (SELECT 1 FROM UNNEST("numberField") AS item WHERE item IS NULL)))')
      })

      it('Should build filter for number notBlank condition', () => {
        expect(
          buildFilterQuery(
            {
              numberField: {
                filterType: 'number',
                condition1: {
                  type: 'notBlank'
                },
              } as FilterNumberDto,
            },
            { numberField: 'number' },
            true
          ),
        ).resolves.toEqual('((EXISTS (SELECT 1 FROM UNNEST("numberField") AS item WHERE item IS NOT NULL)))')
      })
    })
  })

  describe('Numbers filters', () => {
    describe('Normal numbers filters', () => {
      it('Should build filter for numbers with one number', () => {
        expect(
          buildFilterQuery(
            {
              numberField: {
                filterType: 'numbers',
                condition1: {
                  filter: [10],
                },
              } as FilterNumbersDto,
            },
            { numberField: 'numbers' },
          ),
        ).resolves.toEqual('(("numberField" @> \'10\'))')
      })

      it('Should build filter for numbers with two number', () => {
        expect(
          buildFilterQuery(
            {
              numberField: {
                filterType: 'numbers',
                condition1: {
                  filter: [10, 20],
                },
              } as FilterNumbersDto,
            },
            { numberField: 'numbers' },
          ),
        ).resolves.toEqual('(("numberField" @> \'10\' OR "numberField" @> \'20\'))')
      })

      it('Should build filter for numbers for empty', () => {
        expect(
          buildFilterQuery(
            {
              numberField: {
                filterType: 'numbers',
                condition1: {
                  includeEmpty: true,
                  filter: [],
                },
              } as FilterNumbersDto,
            },
            { numberField: 'numbers' },
          ),
        ).resolves.toEqual('(("numberField" = \'[]\'))')
      })

      it('Should build filter for numbers for empty and numbers', () => {
        expect(
          buildFilterQuery(
            {
              numberField: {
                filterType: 'numbers',
                condition1: {
                  includeEmpty: true,
                  filter: [42, 43],
                },
              } as FilterNumbersDto,
            },
            { numberField: 'numbers' },
          ),
        ).resolves.toEqual(
          '(("numberField" @> \'42\' OR "numberField" @> \'43\' OR "numberField" = \'[]\'))',
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
      ).resolves.toEqual(
        '(("I09" ILIKE \'%to%\') AND ("I09" NOT ILIKE \'%ti%\'))',
      )
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
      ).resolves.toEqual('(("I09" ILIKE \'to%\') OR ("I09" ILIKE \'%ti\'))')
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
        )
      ).resolves.toEqual(
        `((EXISTS (SELECT 1 FROM UNNEST("I09") AS item WHERE item ILIKE '%to%'))) AND ((EXISTS (SELECT 1 FROM UNNEST("I08") AS item WHERE item > 10000)) OR (EXISTS (SELECT 1 FROM UNNEST("I08") AS item WHERE item > 20000)))`
      )
    })
  })
})
