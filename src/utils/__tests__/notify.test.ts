import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notifications } from '@mantine/notifications';
import { notifyError } from '../notify';

vi.mock('@mantine/notifications', () => ({
  notifications: { show: vi.fn() },
}));

describe('notifyError', () => {
  beforeEach(() => {
    vi.mocked(notifications.show).mockClear();
  });

  it('shows a red notification with the error message and title', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    notifyError('Save failed', new Error('Network timeout'));
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        color: 'red',
        title: 'Save failed',
        message: 'Network timeout',
        autoClose: false,
      }),
    );
    consoleSpy.mockRestore();
  });

  it('uses fallback message for non-Error values', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    notifyError('Oops', 'raw string error');
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'An unexpected error occurred.' }),
    );
    consoleSpy.mockRestore();
  });

  it('uses fallback message for null/undefined', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    notifyError('Oops', null);
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'An unexpected error occurred.' }),
    );
    consoleSpy.mockRestore();
  });

  it('calls console.error with a prefixed label and the original error', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('kaboom');
    notifyError('My Title', err);
    expect(consoleSpy).toHaveBeenCalledWith('[My Title]', err);
    consoleSpy.mockRestore();
  });
});
