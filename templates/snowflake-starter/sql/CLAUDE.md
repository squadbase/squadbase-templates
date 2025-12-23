# SQL Query Guidelines

Guidelines for writing SQL queries in this directory.

## File Naming

- Use descriptive names: `survival_rate_by_class.sql`, `passengers.sql`
- Use snake_case for file names
- Extension must be `.sql`

## Query Structure Rules

**MUST**: Each SQL file must contain exactly **ONE query**.

### What Counts as "One Query"

- ✅ **Allowed**: A single SELECT statement with CTEs (WITH clauses)
- ✅ **Allowed**: A single query with subqueries
- ❌ **NOT Allowed**: Multiple SELECT statements separated by semicolons
- ❌ **NOT Allowed**: Multiple independent queries in one file

### Examples

**✅ Correct - Single query with CTE:**

```sql
WITH active_users AS (
  SELECT user_id, name
  FROM users
  WHERE active = true
),
user_orders AS (
  SELECT user_id, COUNT(*) as order_count
  FROM orders
  GROUP BY user_id
)
SELECT
  au.name,
  uo.order_count
FROM active_users au
JOIN user_orders uo ON au.user_id = uo.user_id
WHERE uo.order_count >= {{minOrders}}
```

**✅ Correct - Single query with subquery:**

```sql
SELECT name, email
FROM users
WHERE user_id IN (
  SELECT user_id
  FROM orders
  WHERE total_amount > {{minAmount}}
)
```

**❌ Incorrect - Multiple queries:**

```sql
-- DON'T DO THIS
SELECT * FROM users WHERE age > 25;
SELECT * FROM orders WHERE user_id = 123;
```

## Parameter Placeholders

Use correct placeholders for dynamic parameters in queries.

For DuckDB, use `$param_name` syntax.

```sql
SELECT *
FROM users
WHERE age >= $min_age
  AND country = $country
ORDER BY age DESC
LIMIT $limit
```

### Parameter Rules

1. All placeholders must be provided in API request
2. Use meaningful parameter names

## Example Query

```sql
/**
 * Survival Rate by Passenger Class
 *
 * Database Engine:
 *   DuckDB
 *
 * Description:
 *   Analyze survival statistics broken down by passenger class
 *   (First, Second, Third) within a specified age range. Used for
 *   comparing survival rates across socioeconomic classes.
 *
 * Data Source:
 *   upload/titanic_sample/titanic.csv - Titanic passenger dataset
 *
 * Parameters:
 *   $min_age (number) - Minimum age threshold
 *   $max_age (number) - Maximum age threshold
 *
 * Returns:
 *   Pclass (1|2|3) - Passenger class (1: First, 2: Second, 3: Third)
 *   Survived (0|1) - Survival status (0: did not survive, 1: survived)
 *   count (number) - Number of passengers in each class/survival category
 */
SELECT
  Pclass,
  Survived,
  COUNT(*) as count
FROM
  'upload/titanic_sample/titanic.csv'
WHERE
  Age >= $min_age
  AND Age <= $max_age
GROUP BY
  Pclass,
  Survived
ORDER BY
  Pclass,
  Survived;
```

## Best Practices

- **Database Engine**: Always specify the target database engine (e.g., DuckDB, PostgreSQL, Snowflake, BigQuery) in structured comments to clarify SQL dialect and syntax
- **Comments**: Add structured comments including Database Engine, Description, Data Source, Parameters, and Returns
- **Formatting**: Use consistent indentation
- **Limits**: Always include LIMIT for large datasets
- **Readability**: Use clear table/column aliases

## Security Notes

- Use parameterized queries to prevent SQL injection
- All placeholders must be provided in the API request
- Use meaningful parameter names to improve code clarity
