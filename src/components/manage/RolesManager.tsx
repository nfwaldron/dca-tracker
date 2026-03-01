import { useState } from 'react';
import type { Dispatch } from 'react';
import { Stack, Group, Text, TextInput, ActionIcon, Button } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconEdit, IconTrash, IconCheck, IconX, IconPlus } from '../icons';
import { SectionTitle, SectionDesc } from '../ui/Layout';
import type { Action } from '../../types';

export function RolesManager({
  roles,
  dispatch,
}: {
  roles: string[];
  dispatch: Dispatch<Action>;
}) {
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [addValue, setAddValue] = useState('');

  function startEdit(role: string) {
    setEditingRole(role);
    setEditValue(role);
  }

  function commitEdit() {
    if (editingRole && editValue.trim() && editValue.trim() !== editingRole) {
      dispatch({ type: 'RENAME_ROLE', payload: { oldName: editingRole, newName: editValue.trim() } });
    }
    setEditingRole(null);
    setEditValue('');
  }

  function cancelEdit() {
    setEditingRole(null);
    setEditValue('');
  }

  function commitAdd() {
    const label = addValue.trim();
    if (!label) return;
    dispatch({ type: 'ADD_ROLE', payload: label });
    setAddValue('');
  }

  function deleteRole(role: string) {
    modals.openConfirmModal({
      title: 'Delete role',
      children: (
        <Text size="sm">
          Delete role "{role}"? Holdings assigned this role will keep the label but it won't
          appear in the dropdown.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => dispatch({ type: 'DELETE_ROLE', payload: role }),
    });
  }

  return (
    <>
      <SectionTitle>Roles</SectionTitle>
      <SectionDesc>
        Labels that describe each holding's purpose in your portfolio — e.g. "Power Grid",
        "Landlord", "Operating System". They appear in the DCA Planner table and help you
        understand your thematic exposure at a glance. Renaming a role updates all holdings
        that use it automatically.
      </SectionDesc>

      <Stack gap="xs" mb="md">
        {roles.map(role => (
          <Group key={role} gap="xs">
            {editingRole === role ? (
              <>
                <TextInput
                  value={editValue}
                  autoFocus
                  size="xs"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') commitEdit();
                    if (e.key === 'Escape') cancelEdit();
                  }}
                  style={{ width: 200 }}
                />
                <ActionIcon variant="subtle" color="green" size="sm" onClick={commitEdit} title="Save">
                  <IconCheck />
                </ActionIcon>
                <ActionIcon variant="subtle" color="gray" size="sm" onClick={cancelEdit} title="Cancel">
                  <IconX />
                </ActionIcon>
              </>
            ) : (
              <>
                <Text size="sm" style={{ minWidth: 200 }}>{role}</Text>
                <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => startEdit(role)} title="Rename">
                  <IconEdit />
                </ActionIcon>
                <ActionIcon variant="subtle" color="red" size="sm" onClick={() => deleteRole(role)} title="Delete">
                  <IconTrash />
                </ActionIcon>
              </>
            )}
          </Group>
        ))}
      </Stack>

      <Group gap="xs">
        <TextInput
          placeholder="New role name"
          value={addValue}
          size="xs"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddValue(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') commitAdd();
          }}
          style={{ width: 200 }}
        />
        <Button size="xs" leftSection={<IconPlus />} onClick={commitAdd}>
          Add Role
        </Button>
      </Group>
    </>
  );
}
