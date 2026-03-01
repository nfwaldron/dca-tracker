import { notifications } from '@mantine/notifications';

/**
 * Show a persistent red error toast and log to the console.
 * Single place to update notification style/behaviour across the app.
 */
export function notifyError(title: string, err: unknown): void {
  const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
  notifications.show({ color: 'red', title, message, autoClose: false });
  console.error(`[${title}]`, err);
}
