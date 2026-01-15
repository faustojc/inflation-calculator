# Formulas

```ts
const weight = (input: number, totalExpense: number) => input / total;
const currCpi = (commodityCpi: number, weight: number, totalExpense: number) => sum(commodityCpi * weight) / totalExpense;
const growthRate = (currCpi: number, prevCpi: number) => ((currCpi - prevCpi) / prevCpi) * 100;
```
