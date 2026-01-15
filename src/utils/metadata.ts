const yearsSet = new Set<number>();
const regionsSet = new Set<string>();

export const availableYears = Array.from(yearsSet).sort((a, b) => b - a);
export const availableRegions = Array.from(regionsSet).sort((a, b) => a.localeCompare(b));

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
