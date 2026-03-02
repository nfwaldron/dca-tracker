import styled from 'styled-components';
import {
  COLOR_MUTED, COLOR_BORDER, COLOR_ACCENT,
  TABLE_HEADER_BG, TABLE_TOTAL_BG,
  TABLE_TRIGGERED_ROW, TABLE_TRIGGERED_HOVER, TABLE_ROW_HOVER,
} from '../colors';

export const TableWrap = styled.div`
  overflow-x: auto;
  border: 1px solid ${COLOR_BORDER};
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
  background: ${TABLE_HEADER_BG};
  color: ${COLOR_MUTED};
  text-align: ${({ $num }) => ($num ? 'right' : 'left')};
  padding: 0.6rem 0.85rem;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid ${COLOR_BORDER};
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 2;
  ${({ $hideBelow }) => $hideBelow && `@media (max-width: ${$hideBelow}px) { display: none; }`}
`;

export const Td = styled.td<{ $num?: boolean; $bold?: boolean; $muted?: boolean; $hideBelow?: number }>`
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid ${COLOR_BORDER};
  vertical-align: middle;
  ${({ $num }) => $num && 'text-align: right; white-space: nowrap;'}
  ${({ $bold }) => $bold && 'font-weight: 600;'}
  ${({ $muted }) => $muted && `color: ${COLOR_MUTED};`}
  ${({ $hideBelow }) => $hideBelow && `@media (max-width: ${$hideBelow}px) { display: none; }`}
`;

export const TbodyRow = styled.tr<{ $triggered?: boolean }>`
  background: ${({ $triggered }) => ($triggered ? TABLE_TRIGGERED_ROW : 'transparent')};
  &:hover {
    background: ${({ $triggered }) => ($triggered ? TABLE_TRIGGERED_HOVER : TABLE_ROW_HOVER)};
  }
`;

export const TotalTd = styled.td<{ $num?: boolean; $bold?: boolean }>`
  padding: 0.65rem 0.85rem;
  vertical-align: middle;
  background: ${TABLE_TOTAL_BG};
  border-top: 1px solid ${COLOR_BORDER};
  font-size: 0.85rem;
  ${({ $num }) => $num && 'text-align: right; white-space: nowrap;'}
  ${({ $bold }) => $bold && 'font-weight: 600;'}
`;

export const EditTr = styled.tr`
  td {
    background: ${TABLE_TOTAL_BG};
  }
  td:first-child {
    border-left: 3px solid ${COLOR_ACCENT};
  }
`;

export const TickerMain = styled.div`
  font-weight: 700;
  font-size: 0.9rem;
`;

export const TickerSub = styled.div`
  font-size: 0.75rem;
  color: ${COLOR_MUTED};
`;

