Проект сделан на основе [telegraf-template](https://github.com/backmeupplz/telegraf-template)

Вопросы по боту можно писать сюда: https://t.me/GooseInvestAlertChat

Алерты архи
https://miro.com/app/board/o9J_klw3wsU=/?moveToWidget=3458764514989109506&cot=14

WARN: Нужно обновить коллекцию перед тем как
TODO:
- Пагинация 
- Перетерка тикеров
  - Начать в списке тикеров добавлять уникальный id
  - Завязываться на уникальный id при установке алерта и просмотре цены
  - Учесть, что все что берется из модели InstrumentsListModel можвет вернуться не одним элементом
  - Учесть что для крипты в insturmentsList ищем тикер с валютой и без
  - долно корректно работать добавление
  - должна корректно работать проверка цены
  - должен работать чекер цен
  - должны работать шифты
- Дебаг сообщения для шифтов
- отрефактореный модуль add alert должен норм линтиться
- ! Не сломать поддержку проверки цены крипты в рублях и евро

По сути все сцены это
- либо просьба отправить текст
- либо просьба нажать кнопку

Можно сделать просто универсальную сцену у которой будут параметры
- сообщение запроса
- валидатор ввода (если не прошел ретрай)
- сообщение ошибки ввода (необязательное)
- сообщение успешного ввода (необязательный)
- коллбэк, куда вернется провалидированный ввод

В итоге сценарий может быть просто массивом конфигов

[
{
 name: 'price'
 config: {
   ...
 },
 {
   name: 'ticker',
   config: {
     ...
   }
 }
] 

результат
{
 price: 1000,
 name: 'kekek'
}

выполнение

askUser(config, (result) => {}, collectedValues);

collectedValues - значения которые уже есть. Их коллектор пропустит

RELEASE NOTES
- Отказался от указания валюты для крипты, теперь по дефолту доллар (те что устанавливали, будут работать)
- Можно добавлять алерт вот так `/add yndx` 

После этого релиза предложить юзерам вектора
 - скорость реагирования алертов
 - подрубить индикаторы
 - удобная работа со статой (+крипта)
 - Работа шифтов (переход на другую апиху, текущая не позволяет все удобно мониторить) + тут же мониторинг всего сразу + объемы
 - Парсинг новостей (?)
 - Посмотреть еще что у меня есть в листе