// Single source of truth for the SHUTDOWN_MODE kill switch.
// Enabled when process.env.SHUTDOWN_MODE === 'true'. Used by the inbound
// middleware (src/middlewares/shutdownMode.ts) and by every outbound
// notification path (cron alerts) so nothing reaches users while the
// bot is being wound down.
export const isShutdownMode = (): boolean =>
  process.env.SHUTDOWN_MODE === 'true'
