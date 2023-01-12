import { appInitStatuses, InitializationItem } from '../cron'

export const setJobKey = (jobKey?: InitializationItem) => {
  if (!jobKey) {
    return
  }

  if (!appInitStatuses.includes(jobKey)) {
    appInitStatuses.push(jobKey)
  }
}
