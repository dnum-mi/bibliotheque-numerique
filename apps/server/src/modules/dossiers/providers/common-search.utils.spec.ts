import { buildFilterQuery } from './common-search.utils'

describe('Common search utils', () => {
  it('Should build filter for "contains"', () => {
    expect(
      buildFilterQuery(
        {
          toto: {
            filterType: 'text',
            condition1: {
              type: 'contains',
              filter: 'to',
            },
          },
        },
        { toto: 'string' },
      ),
    ).toEqual('WHERE ("toto" LIKE \'%to%\')')
  })

  it('Should build filter for "notContains"', () => {
    expect(
      buildFilterQuery(
        {
          toto: {
            filterType: 'text',
            condition1: {
              type: 'notContains',
              filter: 'to',
            },
          },
        },
        { toto: 'string' },
      ),
    ).toEqual('WHERE ("toto" NOT LIKE \'%to%\')')
  })

  it('Should build filter for "startsWith"', () => {
    expect(
      buildFilterQuery(
        {
          toto: {
            filterType: 'text',
            condition1: {
              type: 'startsWith',
              filter: 'to',
            },
          },
        },
        { toto: 'string' },
      ),
    ).toEqual('WHERE ("toto" LIKE \'to%\')')
  })

  it('Should build filter for "endsWith"', () => {
    expect(
      buildFilterQuery(
        {
          toto: {
            filterType: 'text',
            condition1: {
              type: 'endsWith',
              filter: 'to',
            },
          },
        },
        { toto: 'string' },
      ),
    ).toEqual('WHERE ("toto" LIKE \'%to\')')
  })

  it('Should build filter for "blank"', () => {
    expect(
      buildFilterQuery(
        {
          toto: {
            filterType: 'text',
            condition1: {
              type: 'blank',
              filter: '', // Assuming 'filter' property is empty for 'blank'
            },
          },
        },
        { toto: 'string' },
      ),
    ).toEqual('WHERE ("toto" = \'\')')
  })

  it('Should build filter for "notBlank"', () => {
    expect(
      buildFilterQuery(
        {
          toto: {
            filterType: 'text',
            condition1: {
              type: 'notBlank',
              filter: '', // Assuming 'filter' property is empty for 'notBlank'
            },
          },
        },
        { toto: 'string' },
      ),
    ).toEqual('WHERE ("toto" != \'\')')
  })

  it('Should build filter for two conditions using "AND" operator', () => {
    expect(
      buildFilterQuery(
        {
          toto: {
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
        { toto: 'string' },
      ),
    ).toEqual('WHERE ("toto" LIKE \'%to%\' AND "toto" NOT LIKE \'%ti%\')')
  })

  it('Should build filter for two conditions using "OR" operator', () => {
    expect(
      buildFilterQuery(
        {
          toto: {
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
        { toto: 'string' },
      ),
    ).toEqual('WHERE ("toto" LIKE \'to%\' OR "toto" LIKE \'%ti\')')
  })

  it('Should build filter for multiple fields using "AND" operator', () => {
    expect(buildFilterQuery({
      toto: {
        filterType: 'text',
        condition1: {
          type: 'contains',
          filter: 'to',
        },
      },
      tata: {
        filterType: 'text',
        condition1: {
          type: 'startsWith',
          filter: 'ta',
        },
      },
    }, {
      toto: 'string',
      tata: 'string',
    })).toEqual('WHERE ("toto" LIKE \'%to%\') AND ("tata" LIKE \'ta%\')')
  })
})
