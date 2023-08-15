# Dossier Listing

## About

Since the way we are listing data from field and dossier is complicated, we built queries manually to answer the feature requirements.
To not loose track of what have been done, this file is here to try to explain the logic behind it.

## The problem

The front end application wants to display a list of dossiers. Each column of the list is a field of the dossier. The name of the column is what the user decided in the configuration of the demarche. The user can choose to groupe by dossier or not.
This is two completly different behaviours for us. All the problem comes from the fact that a dossier can have repeatable fields. In this case, we need to display one line per repeatable field.
To give a concret exemple, the excel file in this folder have two tabs. The first one is the result of the query with grouping by dossier. The second one is the result of the query with grouping.
The data in the file, are the one in fixture used for end-to-end testing.
In the first tab, the second line represent the "dsFieldId" of each field.
When we work in our query, we manipulate field with its "dsFieldId". The name of the column is just the label we found from demarche configuration, which have a mappedColumn field.

## The solution

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
        HAVING 'Qatar' = ANY(ARRAY_AGG(CASE WHEN f."dsFieldId" = 'I09' THEN f."stringValue" END) FILTER (WHERE f."dsFieldId" = 'I09'))
    ) sub
),

mainCTE AS (
    SELECT
        d.id as dossier_id,
        ARRAY_AGG(CASE WHEN f."dsFieldId" = 'I01' THEN f."stringValue" END) FILTER (WHERE f."dsFieldId" = 'I01') as Identifiant,
        ARRAY_AGG(CASE WHEN f."dsFieldId" = 'I02' THEN f."stringValue" END) FILTER (WHERE f."dsFieldId" = 'I02') as Moment,
        ARRAY_AGG(CASE WHEN f."dsFieldId" = 'I03' THEN f."stringValue" END) FILTER (WHERE f."dsFieldId" = 'I03') as Titre,
        ARRAY_AGG(CASE WHEN f."dsFieldId" = 'I09' THEN f."stringValue" END) FILTER (WHERE f."dsFieldId" = 'I09') as Pays,
        ARRAY_AGG(CASE WHEN f."dsFieldId" = 'I08' THEN f."stringValue" END) FILTER (WHERE f."dsFieldId" = 'I08') as Montant
    FROM dossiers d
    JOIN fields f ON d.id = f."dossierId"
    GROUP BY d.id
)

SELECT *, (SELECT total_rows FROM countCTE) as total
FROM mainCTE
WHERE 'Qatar' = ANY(Pays)
ORDER BY Moment[1]
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
- For each distinct `"dsFieldId"`, use the `ARRAY_AGG` function and `FILTER` clause to create arrays of corresponding field values.

##### 3. **Main Query**

Combine results from both CTEs, apply filters, sort, and paginate the final output.
- **SELECT** all columns from `mainCTE`.
- Add a column `total` which fetches the count from `countCTE`.
- Use the **WHERE** clause to filter results.
- **ORDER BY** the first value of the `Moment` array.
- Implement pagination with `OFFSET` and `LIMIT`.
---

This query structure ensures an organized approach to extracting comprehensive `dossier` details and also provides a consistent count of records for pagination.


### Not grouping by dossier

All the building and executing of the query that produces the result grouping by dossier can be found in 'field-search.service.ts'. As it is complicated, we isolated the code only for this in one service.

#### Query

Here is the SQL base query the code is based on:
```SQL
WITH repeated AS (
    SELECT
        f."dossierId",
        f."dsFieldId",
        f."stringValue",
        COALESCE(ROW_NUMBER() OVER (PARTITION BY f."dossierId", f."dsFieldId" ORDER BY f."parentRowIndex"), 0) AS row_num
    FROM fields f
    INNER JOIN dossiers d ON f."dossierId" = d.id
    WHERE f."parentRowIndex" IS NOT NULL
    AND f."dsFieldId" IN ('I01', 'I02', 'I03', 'I08', 'I09')
    AND d."demarcheId" = 1
),

non_repeated AS (
    SELECT
        f."dossierId",
        f."dsFieldId",
        f."stringValue"
    FROM fields f
    INNER JOIN dossiers d ON f."dossierId" = d.id
    WHERE f."parentRowIndex" IS NULL
    AND f."dsFieldId" IN ('I01', 'I02', 'I03', 'I08', 'I09')
    AND d."demarcheId" = 1
)

, combined AS (
    SELECT
        n."dossierId",
        MAX(CASE WHEN n."dsFieldId" = 'I01' THEN n."stringValue" END) AS Identifiant,
        MAX(CASE WHEN n."dsFieldId" = 'I02' THEN n."stringValue" END) AS Moment,
        MAX(CASE WHEN n."dsFieldId" = 'I03' THEN n."stringValue" END) AS Titre,
        MAX(CASE WHEN r."dsFieldId" = 'I09' THEN r."stringValue" END) AS Pays,
        MAX(CASE WHEN r."dsFieldId" = 'I08' THEN r."stringValue" END) AS Montant
    FROM non_repeated n
    LEFT JOIN repeated r ON n."dossierId" = r."dossierId"
    GROUP BY n."dossierId", r.row_num
),

counted AS (
  SELECT *,
           COUNT(*) OVER () AS total_count
  FROM combined
  WHERE Pays = 'Qatar' OR Pays IS NULL
  ORDER BY Titre
)

SELECT * FROM counted
OFFSET 0 LIMIT 10;
```

#### Explanation of the Query

This query provides a structured way to extract data from the `fields` table while managing repeated fields. Given the table's design where repeated fields might have separate entries with differing `parentRowIndex`, the query ensures that non-repeated and repeated fields are presented in a unified structure.

##### `repeated` CTE

**Purpose**: Captures fields that are repeated.

**Details**:
- Selects from the `fields` table where `parentRowIndex` is not null, indicating potential repetition.
- An INNER JOIN with the `dossiers` table ensures we only consider entries from dossiers with `demarcheId = 1`.
- The `ROW_NUMBER()` function, partitioning data by `dossierId` and `dsFieldId`, generates a unique `row_num` for each repeated field.

##### `non_repeated` CTE

**Purpose**: Extracts fields that do not repeat.

**Details**:
- Captures entries where `parentRowIndex` is null.
- Similarly, it performs an INNER JOIN with the `dossiers` table to filter data, focusing only on entries with `demarcheId = 1`.

##### `combined` CTE

**Purpose**: Aggregates and aligns data from both the `repeated` and `non_repeated` CTEs.

**Details**:
- Main aim is to align non-repeated fields (like `Identifiant`, `Moment`, and `Titre`) with their corresponding repeated ones (`Pays` and `Montant`).
- The aggregation process involves a LEFT JOIN on `dossierId`, ensuring that every non-repeated field is matched with its relevant repeated field.
- The `GROUP BY` clause, grouping by `dossierId` and `row_num`, makes sure each unique combination of fields gets its row.

##### `counted` CTE

**Purpose**: Calculate the total number of results before applying the `LIMIT`.

**Details**:
- Builds upon the `combined` CTE to calculate the total count using the `COUNT(*) OVER ()` window function.
- The count will be the same for every row, representing the number of rows before pagination.

##### Final Query

**Purpose**: Provides the final filtered, ordered, and paginated result.

**Details**:
- Works with the `counted` CTE to filter, order, and paginate results.
- Filtering targets entries where `Pays` is 'Qatar' or null.
- The results are ordered by `Titre`.
- Pagination is implemented using `OFFSET` and `LIMIT`.







