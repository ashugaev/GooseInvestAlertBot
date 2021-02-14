const plural = require('plural-ru');

// Ечсли число с плавающей запятой вернет то что после точки
const lastVal = (val) => {
    const splitted = val.toString().split('.');

    return splitted[splitted.length - 1];
}

export const plur = {
    days: (val) => val + ' ' + plural(lastVal(val), 'день', 'дня', 'дней'),
    hours: (val) => val + ' ' + plural(lastVal(val), 'час', 'часа', 'часов'),
    percent: (val) => val + ' ' + plural(lastVal(val), 'процент', 'процента', 'процентов')
}
