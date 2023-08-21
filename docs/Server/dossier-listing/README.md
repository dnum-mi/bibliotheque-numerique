# Dossier Listing

## About

Since the way we are listing data from field and dossier is complicated, we built queries manually to answer the feature requirements.
To not loose track of what have been done, this file is here to try to explain the logic behind it.

## The problem

The front end application wants to display a list of dossiers. Each column of the list is a field of the dossier. The name of the column is what the user decided in the configuration of the demarche. The user can choose to groupe by dossier or not.
This is two completly different behaviours for us. All the problem comes from the fact that a dossier can have repeatable fields. In this case, we need to display one line per repeatable field.
To give a concret exemple, the excel file in this folder have two tabs. The first one is the result of the query with grouping by dossier. The second one is the result of the query with grouping.
The data in the file, are the one in fixture used for end-to-end testing.
In the first tab, the second line represent the "sourceId" of each field.
When we work in our query, we manipulate field with its "sourceId". The name of the column is just the label we found from demarche configuration, which have a mappedColumn field.

## The solution

For both of this solution, we did a previous simple query to know in advance the type of the field given its id.
This will allow us to use the string field, the date field or the number field accordingly, and boost performance for filtering those data.
```SQL
SELECT DISTINCT "sourceId", type
        FROM fields
        WHERE "sourceId" IN ("I01", "I02", "I03", "I08", "I09");
```

### Grouping by dossier
All the building and executing of the query that produces the result grouping by dossier can be found in 'dossier-search.service.ts'. As it is complicated, we isolated the code only for this in one service.
#### Query
Here is the SQL base query the code is based on:
```SQL
WITH countCTE AS (
    SELECT COUNT(*) as total_rows
    FROM (
        SELECT d.id
        FROM dossiers d
        JOIN fields f ON d.id = f."dossierId"
        GROUP BY d.id
        HAVING 10000 < ALL(ARRAY_AGG(CASE WHEN f."sourceId" = 'I08' THEN f."numberValue" END) FILTER (WHERE f."sourceId" = 'I08'))
    ) sub
),

mainCTE AS (
    SELECT
        d.id as dossier_id,
        ARRAY_AGG(CASE WHEN f."sourceId" = 'I01' THEN f."stringValue" END) FILTER (WHERE f."sourceId" = 'I01') as "I01",
        ARRAY_AGG(CASE WHEN f."sourceId" = 'I02' THEN f."dateValue" END) FILTER (WHERE f."sourceId" = 'I02') as "I02",
        ARRAY_AGG(CASE WHEN f."sourceId" = 'I03' THEN f."stringValue" END) FILTER (WHERE f."sourceId" = 'I03') as "I03",
        ARRAY_AGG(CASE WHEN f."sourceId" = 'I09' THEN f."stringValue" END) FILTER (WHERE f."sourceId" = 'I09') as "I09",
        ARRAY_AGG(CASE WHEN f."sourceId" = 'I08' THEN f."numberValue" END) FILTER (WHERE f."sourceId" = 'I08') as "I08"
    FROM dossiers d
    JOIN fields f ON d.id = f."dossierId"
    GROUP BY d.id
)

SELECT *, (SELECT total_rows FROM countCTE) as total
FROM mainCTE
WHERE 10000 < ALL("I08")
ORDER BY "I03"[1]
OFFSET 0 LIMIT 5;
```
This specific query select dossier ordered by Moment columns, with pays = QATAR.

#### Explanation

This query is designed to fetch a list of `dossiers` based on specified criteria and also to count the total number of these qualifying `dossiers`. The query uses Common Table Expressions (CTEs) for clarity and organization.

##### 1. **countCTE**

To compute the total number of `dossiers` that have a specific field value.
- **JOIN** the `dossiers` table with `fields` on `dossierId`.
- **GROUP BY** the `d.id` column.
- Use **HAVING** to filter out groups based on the `ARRAY_AGG` function for a specific field value.

##### 2. **mainCTE**

To retrieve detailed records for each `dossier`.
- **JOIN** `dossiers` with `fields`.
- **GROUP BY** the `d.id` column.
- For each distinct `"sourceId"`, use the `ARRAY_AGG` function and `FILTER` clause to create arrays of corresponding field values.
- Select `"stringValue"` or `"numberValue"` or `"dateValue"` based on the type for each ID. We did a first simple query to find thoses types.

##### 3. **Main Query**

Combine results from both CTEs, apply filters, sort, and paginate the final output.
- **SELECT** all columns from `mainCTE`.
- Add a column `total` which fetches the count from `countCTE`.
- Use the **WHERE** clause to filter results.
- **ORDER BY** the first value of the `I03` array.
- Implement pagination with `OFFSET` and `LIMIT`.
---

This query structure ensures an organized approach to extracting comprehensive `dossier` details and also provides a consistent count of records for pagination.


### Not grouping by dossier

All the building and executing of the query that produces the result grouping by dossier can be found in 'field-search.service.ts'. As it is complicated, we isolated the code only for this in one service.

#### Query

Here is the SQL base query the code is based on:
```SQL
WITH repeatedCTE AS (
    SELECT
        f."dossierId",
        f."sourceId",
        f."stringValue",
        f."dateValue",
        f."numberValue",
        COALESCE(ROW_NUMBER() OVER (PARTITION BY f."dossierId", f."sourceId" ORDER BY f."parentRowIndex"), 0) AS maxRowNbr
    FROM fields f
    INNER JOIN dossiers d ON f."dossierId" = d.id
    WHERE f."parentRowIndex" IS NOT NULL
    AND f."sourceId" IN ('I01', 'I02', 'I03', 'I08', 'I09')
    AND d."demarcheId" = 1
),

nonRepeatedCTE AS (
    SELECT
        f."dossierId",
        f."sourceId",
        f."stringValue",
        f."dateValue",
        f."numberValue"
    FROM fields f
    INNER JOIN dossiers d ON f."dossierId" = d.id
    WHERE f."parentRowIndex" IS NULL
    AND f."sourceId" IN ('I01', 'I02', 'I03', 'I08', 'I09')
    AND d."demarcheId" = 1
)

, combinedCTE AS (
    SELECT
        n."dossierId",
        MAX(COALESCE(CASE WHEN n."sourceId" = 'I01' THEN n."stringValue" END,
                     CASE WHEN r."sourceId" = 'I01' THEN r."stringValue" END)) AS "I01",
        MAX(COALESCE(CASE WHEN n."sourceId" = 'I02' THEN n."dateValue" END,
                     CASE WHEN r."sourceId" = 'I02' THEN r."dateValue" END)) AS "I02",
        MAX(COALESCE(CASE WHEN n."sourceId" = 'I03' THEN n."stringValue" END,
                     CASE WHEN r."sourceId" = 'I03' THEN r."stringValue" END)) AS "I03",
        MAX(COALESCE(CASE WHEN n."sourceId" = 'I08' THEN n."numberValue" END,
                     CASE WHEN r."sourceId" = 'I08' THEN r."numberValue" END)) AS "I08",
        MAX(COALESCE(CASE WHEN n."sourceId" = 'I09' THEN n."stringValue" END,
                     CASE WHEN r."sourceId" = 'I09' THEN r."stringValue" END)) AS "I09"
    FROM nonRepeatedCTE n
    LEFT JOIN repeatedCTE r ON n."dossierId" = r."dossierId"
    GROUP BY n."dossierId", r.maxRowNbr
),

countedCTE AS (
  SELECT *,
           COUNT(*) OVER () AS total
  FROM combinedCTE
  WHERE "I09" = 'Qatar'
  ORDER BY "I03"
)

SELECT * FROM countedCTE
OFFSET 0 LIMIT 5;
```

#### Explanation of the Query

This query provides a structured way to extract data from the `fields` table while managing repeated fields. Given the table's design where repeated fields might have separate entries with differing `parentRowIndex`, the query ensures that non-repeated and repeated fields are presented in a unified structure.

##### `repeated` CTE

Captures fields that are repeated.
- Selects from the `fields` table where `parentRowIndex` is not null, indicating potential repetition.
- An INNER JOIN with the `dossiers` table ensures we only consider entries from dossiers with `demarcheId = 1`.
- The `ROW_NUMBER()` function, partitioning data by `dossierId` and `sourceId`, generates a unique `row_num` for each repeated field.

##### `non_repeated` CTE

Extracts fields that do not repeat.
- Captures entries where `parentRowIndex` is null.
- Similarly, it performs an INNER JOIN with the `dossiers` table to filter data, focusing only on entries with `demarcheId = 1`.

##### `combined` CTE:
- This CTE aggregates the data from the `repeatedCTE` and `nonRepeatedCTE`.
- For every field ID, it attempts to fetch a value from both `nonRepeatedCTE` and `repeatedCTE`.
  - It prioritizes non-repeated values, but if it finds none, it falls back to the repeated values.
  - Select `"stringValue"` or `"numberValue"` or `"dateValue"` based on the type for each ID. We did a first simple query to find thoses types.
- This means it dynamically adjusts based on whether a field is repeated or not, taking into account the presence or absence of a `parentRowIndex`.
- The `LEFT JOIN` on `dossierId` ensures that every non-repeated field is presented alongside its corresponding repeated field if present.
- The `GROUP BY` clause groups by `dossierId` and `maxRowNbr` to make sure each unique field combination gets its own row.

##### `counted` CTE

Calculate the total number of results before applying the `LIMIT`.
- Builds upon the `combined` CTE to calculate the total count using the `COUNT(*) OVER ()` window function.
- The count will be the same for every row, representing the number of rows before pagination.

##### Final Query

Provides the final filtered, ordered, and paginated result.
- Works with the `counted` CTE to filter, order, and paginate results.
- Filtering targets entries where `Pays` is 'Qatar' or null.
- The results are ordered by `Titre`.
- Pagination is implemented using `OFFSET` and `LIMIT`.







