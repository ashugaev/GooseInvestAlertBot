export enum Scenes {
  alertMessage = 'alertAddMessageScene',
  alertAdd = 'alertAddScene',
  shiftAdd = 'shiftAddScene',
}

export enum Actions {
  list_tickerPage = 'list_tickerPage',
  list_editAlert = 'list_editAlert',
  list_deleteAlert = 'list_deleteAlert',
  shift_delete = 'shift_delete',
  list_instrumentsPage = 'liP',
  list_shiftsPage = 'lShp',
  list_shiftEditPage = 'shEp',
  list_shiftDeleteOne = 'ddf',
}

export enum Limits {
  alerts = 100,
  stats = 1,
  // Скорость цены
  shifts = 15,
}
