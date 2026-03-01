import { Modal, Text, Badge, Stack, ScrollArea } from '@mantine/core';

const GLOSSARY: { term: string; plain: string }[] = [
  {
    term: 'DCA',
    plain:
      'Dollar-Cost Averaging — investing a fixed amount on a regular schedule regardless of price. Buying consistently reduces the impact of volatility because you buy more shares when prices are low and fewer when they are high.',
  },
  {
    term: 'Core holding',
    plain:
      'A stock you invest in every paycheck. Core holdings appear in the DCA Planner and receive an equal share of your budget each pay period.',
  },
  {
    term: 'Extra',
    plain:
      'A stock you own but are not actively DCA\'ing right now. Included in your Portfolio totals but excluded from DCA budget math.',
  },
  {
    term: 'Watchlist',
    plain:
      'A stock you are tracking but do not own yet. Prices are fetched so you can monitor it — no budget is allocated.',
  },
  {
    term: 'Slot',
    plain:
      'One equal share of your DCA budget. Your total budget is divided into slots — one per solo core holding, one per bucket (group). Example: $500 budget ÷ 5 slots = $100 per slot per pay period.',
  },
  {
    term: 'Bucket',
    plain:
      'A named group of core holdings that together share a single slot. Useful when you want two related stocks (e.g. two energy stocks) to split one allocation rather than each getting a full slot.',
  },
  {
    term: 'Triggered',
    plain:
      'A stock is triggered when its price drops 20% or more below its 52-week high (or all-time high if set), OR falls below its 200-day moving average. This signals a potential buying opportunity — but it does not automatically change your investment. You have to opt in by toggling Double Down.',
  },
  {
    term: 'Double Down',
    plain:
      'Opting in to deploy extra money into a triggered stock on top of its regular DCA allocation. Funded by a separate Double-Down Budget you configure. Only stocks you deliberately activate receive this extra amount.',
  },
  {
    term: '200-day Moving Average (200-MA)',
    plain:
      'The average of a stock\'s closing prices over the past 200 trading days. A common indicator of the long-term price trend. If the current price falls below this average, it is one of the two conditions that trigger the Double Down signal.',
  },
  {
    term: '52-Week High (52W High)',
    plain:
      'The highest price the stock traded at in the past 52 weeks. A drop of 20% or more from this level is the other trigger condition. The app tracks this as a floor — it never resets downward due to a rolling window.',
  },
  {
    term: 'All-Time High (ATH)',
    plain:
      'The highest price the stock has ever traded at. You can override the 52-week high with the ATH for stocks whose peak was more than a year ago, keeping your trigger threshold accurate.',
  },
  {
    term: 'Cost Basis',
    plain:
      'The total amount of money you have spent buying a stock across all purchases. Used to calculate your unrealized gain or loss: Market Value − Cost Basis.',
  },
  {
    term: 'Weighted Average Cost (Wtd Avg)',
    plain:
      'Your average price paid per share, calculated as total amount spent ÷ total shares owned across all broker positions.',
  },
  {
    term: 'Unrealized Gain / Loss (G/L)',
    plain:
      '"Unrealized" means you have not sold the stock yet, so the gain or loss exists only on paper. It is the difference between what you paid (cost basis) and what it is worth today (market value).',
  },
  {
    term: 'Pay Frequency',
    plain:
      'How often you get paid and invest. This controls what "one pay period" means for all budget calculations. Set it to match your actual pay cycle: weekly, bi-weekly, or monthly.',
  },
];

export function GlossaryModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700} size="md">Glossary — Plain English Definitions</Text>}
      size="lg"
    >
      <ScrollArea h={520} offsetScrollbars>
        <Stack gap="md" pr="xs">
          {GLOSSARY.map(({ term, plain }) => (
            <div
              key={term}
              style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}
            >
              <Badge color="blue" variant="light" mb={6} radius="sm" style={{ textTransform: 'none', fontSize: '0.78rem' }}>
                {term}
              </Badge>
              <Text size="sm" c="dimmed" style={{ lineHeight: 1.65 }}>
                {plain}
              </Text>
            </div>
          ))}
          <Text size="xs" c="dimmed" style={{ fontStyle: 'italic', paddingBottom: '0.5rem' }}>
            This app is for personal tracking only. Nothing here constitutes financial advice.
          </Text>
        </Stack>
      </ScrollArea>
    </Modal>
  );
}
