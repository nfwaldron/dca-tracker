import styled from 'styled-components';

export const TableWrap = styled.div`
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 10px;
  margin-bottom: 1.5rem;
`;

export const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  tbody tr:last-child td {
    border-bottom: none;
  }
`;

export const Th = styled.th<{ $num?: boolean; $hideBelow?: number }>`
  background: #253347;
  color: var(--muted);
  text-align: ${({ $num }) => ($num ? 'right' : 'left')};
  padding: 0.6rem 0.85rem;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
  ${({ $hideBelow }) => $hideBelow && `@media (max-width: ${$hideBelow}px) { display: none; }`}
`;

export const Td = styled.td<{ $num?: boolean; $bold?: boolean; $muted?: boolean; $hideBelow?: number }>`
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
  ${({ $num }) => $num && 'text-align: right; white-space: nowrap;'}
  ${({ $bold }) => $bold && 'font-weight: 600;'}
  ${({ $muted }) => $muted && 'color: var(--muted);'}
  ${({ $hideBelow }) => $hideBelow && `@media (max-width: ${$hideBelow}px) { display: none; }`}
`;

export const TbodyRow = styled.tr<{ $triggered?: boolean }>`
  background: ${({ $triggered }) => ($triggered ? '#ef444408' : 'transparent')};
  &:hover {
    background: ${({ $triggered }) => ($triggered ? '#ef44440f' : '#ffffff08')};
  }
`;

export const TotalTd = styled.td<{ $num?: boolean; $bold?: boolean }>`
  padding: 0.65rem 0.85rem;
  vertical-align: middle;
  background: #1a2740;
  border-top: 1px solid var(--border);
  font-size: 0.85rem;
  ${({ $num }) => $num && 'text-align: right; white-space: nowrap;'}
  ${({ $bold }) => $bold && 'font-weight: 600;'}
`;

export const EditTr = styled.tr`
  td {
    background: #1a2740;
  }
  td:first-child {
    border-left: 3px solid var(--accent);
  }
`;

export const TickerMain = styled.div`
  font-weight: 700;
  font-size: 0.9rem;
`;

export const TickerSub = styled.div`
  font-size: 0.75rem;
  color: var(--muted);
`;
