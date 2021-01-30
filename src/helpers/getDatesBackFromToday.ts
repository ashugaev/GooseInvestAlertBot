export const getDatesBackFromToday = (days: number):[string, string] => {
    const dateTo = new Date();
    const dateToISO = dateTo.toISOString();

    dateTo.setDate(dateTo.getDate() - days)

    const dateFromISO = dateTo.toISOString();

    return [dateToISO, dateFromISO];
}
