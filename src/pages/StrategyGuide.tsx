import {
  Container,
  Title,
  Text,
  Stack,
  Accordion,
  Alert,
  List,
  Group,
  Badge,
  Divider,
  Paper,
  Box,
  Anchor,
  ThemeIcon,
} from '@mantine/core';
import {
  BsInfoCircle,
  BsExclamationTriangle,
  BsLightbulb,
  BsCheckCircle,
  BsBookmark,
  BsYoutube,
  BsHeartFill,
} from 'react-icons/bs';
import { MC_BLUE_5, MC_GREEN_5, MC_TEAL_5, MC_ORANGE_5, MC_VIOLET_5 } from '../components/ui/colors';

export default function StrategyGuide() {
  return (
    <Container maw={860} py="xl">
      <Stack gap="xs" mb="xl">
        <Group gap="xs">
          <Badge color="blue" variant="light" size="sm">Tom Nash</Badge>
          <Badge color="teal" variant="light" size="sm">DCA Strategy</Badge>
        </Group>
        <Title order={1} fw={800}>Enhanced DCA Strategy Guide</Title>
        <Text c="dimmed" size="md" maw={640}>
          A comprehensive guide to Dollar-Cost Averaging with the "Double Down" enhancement —
          a disciplined framework for building long-term wealth through consistent investing and
          strategic position sizing during market dips.
        </Text>
        <Alert color="gray" variant="outline" icon={<BsInfoCircle />} mt="xs">
          <Text size="xs">
            <strong>Disclaimer:</strong> The information in this guide is for educational purposes only
            and does not constitute financial advice. Investing involves risk, including possible loss
            of principal. Consult a qualified financial advisor before making investment decisions.
          </Text>
        </Alert>
      </Stack>

      {/* ── Credit ─────────────────────────────────────────────────────────── */}
      <Paper withBorder p="lg" radius="md" mt="xl" style={{ borderLeft: `3px solid ${MC_ORANGE_5}` }}>
        <Group gap="sm" mb="xs" align="center">
          <ThemeIcon size="md" radius="xl" color="orange" variant="light">
            <BsHeartFill size={12} />
          </ThemeIcon>
          <Text fw={700} size="sm">Strategy by Tom Nash</Text>
        </Group>
        <Text size="sm" c="dimmed" mb="md">
          This Enhanced DCA + Double Down strategy was created and shared freely by{' '}
          <strong>Tom Nash</strong> — investor, educator, and one of the most straightforward voices
          in retail investing. Tom publishes his full strategy on his Patreon at no cost and
          explains the philosophy in depth on YouTube. This app exists to make that strategy
          easier to execute — all credit for the approach goes to him.
        </Text>
        <Group gap="xl">
          <Anchor
            href="https://www.youtube.com/watch?v=GzTpIeT3prY"
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
            fw={600}
          >
            <Group gap={6} align="center">
              <BsYoutube size={16} color="#FF0000" />
              Watch the strategy announcement
            </Group>
          </Anchor>
          <Anchor
            href="https://www.patreon.com/cw/tomnash"
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
            fw={600}
          >
            Get the full strategy on Patreon (free)
          </Anchor>
        </Group>
      </Paper>

      <Divider my="xl" />

      <Accordion variant="separated" radius="md" chevronPosition="left">

        {/* Section 1 */}
        <Accordion.Item value="intro">
          <Accordion.Control>
            <Group gap="sm">
              <Text fw={700} size="sm" c="dimmed">01</Text>
              <Text fw={600}>Introduction to Dollar-Cost Averaging (DCA)</Text>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="lg" p="xs">

              <Stack gap="xs">
                <Title order={4} c="blue.4">1.1 What Is DCA?</Title>
                <Text size="sm">
                  Dollar-cost averaging (DCA) is a technique where you invest a fixed amount of money
                  into a particular stock, ETF, or mutual fund at regular intervals — often weekly or
                  monthly. Instead of trying to "time" the market by predicting highs and lows, you buy
                  shares consistently, rain or shine. This results in purchasing shares at varying prices
                  over time, which eventually averages out the cost basis of your holdings.
                </Text>
                <Text size="sm">
                  The core advantage is that it removes much of the emotional stress and guesswork from
                  investing. If the market is rising, you keep investing; if the market is dipping, you
                  still keep investing. In the long run, you accumulate more shares at a more favorable
                  average price than if you attempted to guess the best times to buy.
                </Text>
              </Stack>

              <Stack gap="xs">
                <Title order={4} c="blue.4">1.2 Historical Context and Why It Works</Title>
                <Text size="sm">
                  The concept of DCA has been around for decades. Financial experts recommend it,
                  especially for new investors, as a systematic way to participate in the market.
                  Historically, the U.S. stock market has trended upward over long periods, despite
                  inevitable periods of recession and turmoil. By investing continuously over many
                  months or years, you benefit from this upward drift without being paralyzed by
                  day-to-day fluctuations.
                </Text>
                <Alert color="teal" variant="light" icon={<BsLightbulb />} title="Illustrative Example">
                  <Text size="sm">
                    Imagine you have $500 to invest monthly in an S&P 500 index fund. Over a year, the
                    share price may go up some months and down others. In some months, $500 could buy
                    4 shares; in others, you might get 5 or 6 shares when the price is lower. Over time,
                    you accumulate shares at different prices — creating a blended average cost.
                  </Text>
                </Alert>
              </Stack>

              <Stack gap="xs">
                <Title order={4} c="blue.4">1.3 Benefits and Limitations of DCA</Title>
                <Group align="flex-start" gap="xl" grow>
                  <Paper withBorder p="md" radius="md">
                    <Text size="xs" fw={700} tt="uppercase" c="green.4" mb="xs">Benefits</Text>
                    <List size="sm" spacing="xs" icon={<BsCheckCircle color={MC_GREEN_5} />}>
                      <List.Item>Reduces the impact of market volatility on your psyche</List.Item>
                      <List.Item>Keeps you disciplined, ensuring you invest regularly</List.Item>
                      <List.Item>Helps avoid the pitfalls of emotional decision-making</List.Item>
                    </List>
                  </Paper>
                  <Paper withBorder p="md" radius="md">
                    <Text size="xs" fw={700} tt="uppercase" c="red.4" mb="xs">Limitations</Text>
                    <List size="sm" spacing="xs">
                      <List.Item>You won't necessarily capture the absolute bottom price</List.Item>
                      <List.Item>If markets trend up quickly, a lump-sum might perform better</List.Item>
                      <List.Item>Requires consistent cash flow and commitment</List.Item>
                    </List>
                  </Paper>
                </Group>
              </Stack>

            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Section 2 */}
        <Accordion.Item value="setup">
          <Accordion.Control>
            <Group gap="sm">
              <Text fw={700} size="sm" c="dimmed">02</Text>
              <Text fw={600}>Setting Up Your DCA Profile</Text>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="lg" p="xs">

              <Stack gap="xs">
                <Title order={4} c="blue.4">2.1 Determining Your Regular Investment Amount</Title>
                <Text size="sm">
                  Figure out how much money you can consistently invest without causing financial strain.
                  Investing should not compromise your ability to pay bills or maintain an emergency fund.
                  Ask yourself:
                </Text>
                <List size="sm" spacing="xs">
                  <List.Item>How much discretionary income do I have each month after covering necessary expenses?</List.Item>
                  <List.Item>Am I setting aside enough cash for an emergency fund (generally 3–6 months' worth of expenses)?</List.Item>
                  <List.Item>Do I have any short-term financial goals — such as buying a home or car — that will require liquid assets?</List.Item>
                </List>
                <Text size="sm">
                  Consistency is vital. If $500 a month is manageable and will not derail your household
                  finances, that's a good starting point. The key is to stick to an amount that fits your
                  financial reality.
                </Text>
              </Stack>

              <Stack gap="xs">
                <Title order={4} c="blue.4">2.2 Choosing Your Investment Targets</Title>
                <Text size="sm">Determine which stocks, ETFs, or mutual funds you want to invest in. This choice depends on:</Text>
                <List size="sm" spacing="xs">
                  <List.Item><strong>Risk Tolerance:</strong> If you're conservative, a broad market ETF (like one tracking the S&P 500) offers diversification and a steadier growth trajectory.</List.Item>
                  <List.Item><strong>Investment Horizon:</strong> In your 20s or 30s, you can handle more volatility and invest in growth stocks. Nearing retirement, tilt toward more stable, income-producing securities.</List.Item>
                  <List.Item><strong>Convictions and Knowledge:</strong> Some investors concentrate on industries they know well; others prefer index funds for simplicity.</List.Item>
                </List>
                <Text size="sm">
                  It's important that you genuinely believe in the long-term potential of your chosen
                  investments. If you're heavily invested in a particular industry, make sure you have
                  done thorough research or trust the management teams behind the companies in that sector.
                </Text>
              </Stack>

              <Stack gap="xs">
                <Title order={4} c="blue.4">2.3 Automating Your Investments</Title>
                <Text size="sm">
                  To reap the full benefits of DCA, set up an automatic transfer or auto-invest plan
                  through your brokerage. This removes the guesswork and emotional friction of deciding
                  when to invest each month.
                </Text>
                <Alert color="blue" variant="light" icon={<BsBookmark />} title="Tips for Setting Up Automation">
                  <List size="sm" spacing="xs">
                    <List.Item>Pick a date that aligns with your payday or when your account has a comfortable balance</List.Item>
                    <List.Item>Double-check your brokerage settings to confirm investments are directed to the right stock or ETF</List.Item>
                    <List.Item>Start small if needed, and gradually increase the amount as you get more comfortable or your income grows</List.Item>
                  </List>
                </Alert>
              </Stack>

            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Section 3 */}
        <Accordion.Item value="doubledown">
          <Accordion.Control>
            <Group gap="sm">
              <Text fw={700} size="sm" c="dimmed">03</Text>
              <Text fw={600}>Mastering the "Double Down" Strategy</Text>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="lg" p="xs">

              <Alert color="teal" variant="light">
                <Text size="sm">
                  The "double down" strategy is an enhancement to regular DCA designed to help you take
                  advantage of significant dips in the market. While plain DCA has you investing a fixed
                  amount no matter what, the double down approach instructs you to <strong>increase your
                  investment during particularly large and temporary declines</strong> — provided you
                  have strong convictions about the fundamentals of the stock or fund.
                </Text>
              </Alert>

              <Stack gap="xs">
                <Title order={4} c="blue.4">3.1 How the Double Down Feature Enhances DCA</Title>
                <Text size="sm">
                  Traditionally, DCA can limit your upside if you have additional capital to deploy
                  during market lows. By doubling down on your positions when they fall <strong>20% or
                  more below their 52-week high</strong>, you're essentially buying more shares at a discount.
                </Text>
                <Paper withBorder p="md" radius="md" style={{ borderLeft: `3px solid ${MC_BLUE_5}` }}>
                  <Text size="xs" fw={700} tt="uppercase" c="blue.4" mb="xs">Why 20%?</Text>
                  <Text size="sm">
                    A 20% drop is significant enough to represent a substantial correction, often driven
                    by negative news or broader market sentiment. However, not all 20% drops are created
                    equal. The company or ETF in question should still have sound fundamentals and a
                    favorable long-term outlook.
                  </Text>
                </Paper>
              </Stack>

              <Stack gap="xs">
                <Title order={4} c="blue.4">3.2 Identifying Market Dips</Title>
                <Text size="sm">Before you double down, confirm you're dealing with a dip rather than a fundamental collapse. Tools to use:</Text>
                <List size="sm" spacing="xs">
                  <List.Item><strong>Price Charts:</strong> Most brokerages will show you a 52-week high and the current percentage difference from that high.</List.Item>
                  <List.Item><strong>News and Analysis:</strong> Check recent news articles, company filings (10-Qs or 10-Ks), and analyst reports to ensure the drop isn't due to a severe, long-term issue such as bankruptcy risk or major regulatory problems.</List.Item>
                  <List.Item><strong>Industry Trends:</strong> Sometimes entire sectors fall in tandem due to macroeconomic events (e.g., a rise in interest rates affecting tech stocks broadly). If the dip seems tied to short-term sentiment rather than fundamental weakness, it could be an opportune moment to double down.</List.Item>
                </List>
              </Stack>

              <Stack gap="xs">
                <Title order={4} c="blue.4">3.3 Determining Fundamental Strength</Title>
                <Text size="sm">To effectively use the double down strategy, you must be confident the company remains strong from a business perspective. Areas to check:</Text>
                <List size="sm" spacing="xs">
                  <List.Item><strong>Revenue and Earnings Growth:</strong> Are revenues and earnings stable or steadily increasing over the past few quarters or years?</List.Item>
                  <List.Item><strong>Management Quality:</strong> Does the leadership team have a track record of guiding the company through challenging times?</List.Item>
                  <List.Item><strong>Competitive Moat:</strong> Does the company have a lasting competitive advantage — brand power, proprietary technology, high switching costs?</List.Item>
                  <List.Item><strong>Debt Levels:</strong> A heavily indebted company might struggle to weather a sustained downturn, making double-down investments riskier.</List.Item>
                </List>
              </Stack>

              <Stack gap="xs">
                <Title order={4} c="blue.4">3.4 Practical Example of Double Down</Title>
                <Alert color="teal" variant="light" icon={<BsLightbulb />} title="TechCorp Example">
                  <Stack gap="xs">
                    <Text size="sm">
                      You're investing $500/month in TechCorp. Its 52-week high is $100/share. Suddenly,
                      TechCorp dips to $80 — a 20% drop due to broad market sentiment.
                    </Text>
                    <List size="sm" spacing="xs" type="ordered">
                      <List.Item><strong>Confirm Fundamentals:</strong> You check TechCorp's earnings report — revenue is still growing and new product lines are rolling out as planned.</List.Item>
                      <List.Item><strong>Decide to Double Down:</strong> Instead of your usual $500, you invest $1,000 or more that month. You continue doing so as long as TechCorp remains 20%+ below its 52-week high.</List.Item>
                      <List.Item><strong>Return to Normal Once Recovered:</strong> If TechCorp's price recovers to within that 20% threshold, you revert to your standard $500 monthly allocation.</List.Item>
                    </List>
                    <Text size="sm" c="dimmed">
                      This surge in investment when prices are low can significantly reduce your average
                      cost basis, positioning you for greater upside when the stock rebounds.
                    </Text>
                  </Stack>
                </Alert>
              </Stack>

            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Section 4 */}
        <Accordion.Item value="discipline">
          <Accordion.Control>
            <Group gap="sm">
              <Text fw={700} size="sm" c="dimmed">04</Text>
              <Text fw={600}>Discipline and Emotional Control</Text>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="lg" p="xs">

              <Stack gap="xs">
                <Title order={4} c="blue.4">4.1 Why Discipline Is Paramount</Title>
                <Text size="sm">
                  One of the biggest challenges for investors is their own emotional response to market
                  volatility. Fear can paralyze you when prices plummet, leading you to sell at
                  inopportune moments. Conversely, greed can tempt you to overextend yourself when
                  stocks soar.
                </Text>
                <Text size="sm">
                  By creating a structured DCA plan with the double down strategy, you're setting
                  guardrails for your emotional behavior. You already know what you'll do in the event
                  of market dips or rallies, so you're far less likely to make impulsive decisions.
                </Text>
              </Stack>

              <Stack gap="xs">
                <Title order={4} c="blue.4">4.2 Avoiding the Pitfalls of Market Timing</Title>
                <Text size="sm">
                  Market timing is the act of attempting to predict the optimal times to buy or sell.
                  Historically, even professional fund managers find it extremely difficult to time the
                  market consistently. A structured approach like DCA coupled with disciplined doubling
                  down ensures you're active in the market, but not overexposed to the unpredictability
                  of short-term price swings.
                </Text>
                <Alert color="yellow" variant="light" icon={<BsExclamationTriangle />} title="Key Pitfalls to Avoid">
                  <List size="sm" spacing="xs">
                    <List.Item><strong>Panic Selling:</strong> When the market corrects, people often feel a fight-or-flight response. A plan helps prevent hasty decisions.</List.Item>
                    <List.Item><strong>FOMO Buying:</strong> Seeing stocks surge can tempt you to throw more money in at potentially inflated prices. The double down strategy is for buying dips, not chasing rallies.</List.Item>
                    <List.Item><strong>Ignoring Fundamentals:</strong> Don't let hype or short-term news overshadow the importance of a company's intrinsic value.</List.Item>
                  </List>
                </Alert>
              </Stack>

              <Stack gap="xs">
                <Title order={4} c="blue.4">4.3 Staying Rational During Volatility</Title>
                <Text size="sm">
                  Volatility is inevitable. The S&P 500 historically experiences a 10% drawdown at some
                  point each year. Correction phases can be healthy, providing opportunities for disciplined
                  investors to buy more at lower prices.
                </Text>
                <Text size="sm">A practical way to stay rational — create a simple checklist. Before making any investment or doubling down, ask yourself:</Text>
                <Paper withBorder p="md" radius="md">
                  <List size="sm" spacing="xs" icon={<BsCheckCircle color={MC_BLUE_5} />}>
                    <List.Item>Has my investment thesis changed?</List.Item>
                    <List.Item>Are the fundamentals still intact?</List.Item>
                    <List.Item>Am I acting out of fear or rational analysis?</List.Item>
                    <List.Item>Does this align with my overall financial goals and risk tolerance?</List.Item>
                  </List>
                </Paper>
              </Stack>

            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Section 5 */}
        <Accordion.Item value="review">
          <Accordion.Control>
            <Group gap="sm">
              <Text fw={700} size="sm" c="dimmed">05</Text>
              <Text fw={600}>Reviewing and Adjusting Your Plan</Text>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="lg" p="xs">

              <Stack gap="xs">
                <Title order={4} c="blue.4">5.1 Periodic Portfolio Check-Ups</Title>
                <Text size="sm">
                  While automation is crucial, it's still wise to review your holdings periodically to
                  ensure they align with your goals. A quarterly or biannual checkup might suffice for
                  many long-term investors, but some prefer monthly reviews. During these reviews, look for:
                </Text>
                <List size="sm" spacing="xs">
                  <List.Item><strong>Portfolio Balance:</strong> Are you overly concentrated in one sector?</List.Item>
                  <List.Item><strong>Performance vs. Benchmarks:</strong> How do your positions compare to relevant market benchmarks (S&P 500, NASDAQ, etc.)?</List.Item>
                  <List.Item><strong>New Market Conditions:</strong> Have there been significant macroeconomic changes that alter your investment outlook?</List.Item>
                </List>
              </Stack>

              <Stack gap="xs">
                <Title order={4} c="blue.4">5.2 When (and How) to Adjust Contributions</Title>
                <Text size="sm">
                  Your financial situation might change over time — a promotion, job loss, or new
                  expenses like a mortgage or child's education. These life events may necessitate
                  changes in how much you can comfortably invest.
                </Text>
                <Text size="sm" fw={600}>Guidelines for Adjusting:</Text>
                <List size="sm" spacing="xs">
                  <List.Item><strong>Income Changes:</strong> If you earn more, consider increasing your monthly investment proportionally. If you earn less, reduce contributions to maintain financial stability.</List.Item>
                  <List.Item><strong>Asset Allocation:</strong> As you move through different life stages, shift some DCA contributions into less volatile assets like bonds or dividend-paying stocks.</List.Item>
                  <List.Item><strong>Goal Shifts:</strong> If you decide to buy a house in two years, temporarily allocate some funds to a safer, more liquid account.</List.Item>
                </List>
              </Stack>

              <Stack gap="xs">
                <Title order={4} c="blue.4">5.3 Balancing Long-Term Strategy with Changing Goals</Title>
                <Text size="sm">
                  We don't live static lives. Strategies that worked when you were single and in your 20s
                  might need reevaluation once you have a family or are approaching retirement. The beauty
                  of DCA is that it remains effective over many decades, but you might modify the exact
                  stocks or ETFs you invest in based on your evolving financial goals and risk tolerance.
                </Text>
                <Alert color="blue" variant="light">
                  <Text size="sm">
                    <strong>Remember:</strong> Consistency doesn't mean stubbornness. You can stick to
                    the system while still making nuanced adjustments that reflect your personal
                    circumstances.
                  </Text>
                </Alert>
              </Stack>

            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Section 6 */}
        <Accordion.Item value="faq">
          <Accordion.Control>
            <Group gap="sm">
              <Text fw={700} size="sm" c="dimmed">06</Text>
              <Text fw={600}>Common Questions and Concerns</Text>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="lg" p="xs">

              <Stack gap="xs">
                <Title order={4} c="blue.4">6.1 How Do I Know If I'm Overinvesting?</Title>
                <Text size="sm">
                  Overinvesting occurs when you allocate so much of your disposable income to investments
                  that you cannot handle emergencies or daily expenses. A telltale sign is if you find
                  yourself racking up credit card debt to cover basic needs, or if you're constantly
                  stressed about bills.
                </Text>
                <Alert color="yellow" variant="light" icon={<BsExclamationTriangle />} title="Best Practice">
                  <Text size="sm">
                    Always prioritize having a robust emergency fund and paying off high-interest debt
                    before committing to an aggressive investment schedule.
                  </Text>
                </Alert>
              </Stack>

              <Stack gap="xs">
                <Title order={4} c="blue.4">6.2 Should I Ever Pause My DCA?</Title>
                <Text size="sm">
                  Generally, stopping your DCA is not recommended during market downturns — that's
                  actually when the strategy is most powerful. However, there are a few legitimate
                  reasons you might pause or temporarily reduce contributions:
                </Text>
                <List size="sm" spacing="xs">
                  <List.Item><strong>Medical Emergency or Job Loss:</strong> Immediate financial needs could take priority.</List.Item>
                  <List.Item><strong>Major Life Events:</strong> A wedding, birth of a child, or caring for elderly parents may require short-term liquidity.</List.Item>
                  <List.Item><strong>Re-Evaluation of Strategy:</strong> If you fundamentally lose confidence in the company or sector you've been investing in, it might be wise to pause and reassess.</List.Item>
                </List>
                <Text size="sm" c="dimmed">
                  The key is to differentiate between an emotional reaction to volatility and a genuine
                  change in your financial circumstances or investment thesis.
                </Text>
              </Stack>

              <Stack gap="xs">
                <Title order={4} c="blue.4">6.3 Handling Emotional Overreactions</Title>
                <Text size="sm">
                  Emotions are part of being human. As you see your portfolio value fluctuating, remind
                  yourself of the bigger picture. Consider adopting strategies like:
                </Text>
                <List size="sm" spacing="xs">
                  <List.Item><strong>Limiting Portfolio Checks:</strong> Constantly refreshing your brokerage account can amplify stress.</List.Item>
                  <List.Item><strong>Journal Your Decisions:</strong> Write down the reasons for your investments and any modifications you make. This helps keep you accountable and logical.</List.Item>
                  <List.Item><strong>Talk to Peers or Mentors:</strong> Sometimes an external, objective view can help you maintain perspective.</List.Item>
                </List>
              </Stack>

            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Section 7 */}
        <Accordion.Item value="conclusion">
          <Accordion.Control>
            <Group gap="sm">
              <Text fw={700} size="sm" c="dimmed">07</Text>
              <Text fw={600}>Conclusion and Next Steps</Text>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="lg" p="xs">

              <Text size="sm">
                By adopting the 2X DCA and Double Down System, you're taking a powerful approach to
                building long-term wealth in the stock market. Let's recap:
              </Text>

              <Stack gap="sm">
                <Paper withBorder p="md" radius="md" style={{ borderLeft: `3px solid ${MC_BLUE_5}` }}>
                  <Text size="sm" fw={600} mb={4}>Dollar-Cost Averaging (DCA) is foundational</Text>
                  <Text size="sm" c="dimmed">You invest a fixed amount periodically, regardless of market swings. Over time, this consistency helps lower your average cost and simplifies your decision-making.</Text>
                </Paper>
                <Paper withBorder p="md" radius="md" style={{ borderLeft: `3px solid ${MC_TEAL_5}` }}>
                  <Text size="sm" fw={600} mb={4}>Double Down adds a layer of strategy</Text>
                  <Text size="sm" c="dimmed">When a quality stock or ETF drops 20% or more below its 52-week high, and you're confident in its fundamentals, you increase your investments to capitalize on the discount.</Text>
                </Paper>
                <Paper withBorder p="md" radius="md" style={{ borderLeft: `3px solid ${MC_ORANGE_5}` }}>
                  <Text size="sm" fw={600} mb={4}>Discipline is non-negotiable</Text>
                  <Text size="sm" c="dimmed">Emotional reactions can lead to poor choices, especially in volatile markets. A structured plan helps you avoid panic selling or reckless buying.</Text>
                </Paper>
                <Paper withBorder p="md" radius="md" style={{ borderLeft: `3px solid ${MC_VIOLET_5}` }}>
                  <Text size="sm" fw={600} mb={4}>Flexibility is key</Text>
                  <Text size="sm" c="dimmed">Life events and changing goals may require you to adjust your DCA contributions. Regularly reviewing your plan ensures it remains aligned with your financial situation.</Text>
                </Paper>
              </Stack>

              <Stack gap="xs">
                <Title order={4} c="blue.4">Action Steps to Solidify Your Learning</Title>
                <List size="sm" spacing="xs" type="ordered">
                  <List.Item><strong>Set Up Automation:</strong> Schedule an automatic monthly or weekly investment through your brokerage.</List.Item>
                  <List.Item><strong>Identify Your Watchlist:</strong> Create a small list of stocks or ETFs whose fundamentals you truly believe in.</List.Item>
                  <List.Item><strong>Create a Double Down Threshold:</strong> Clearly define your "double down" rules. Use the recommended 20% drop marker or tweak it based on your comfort level.</List.Item>
                  <List.Item><strong>Maintain an Investment Diary:</strong> Whether digital or handwritten, track your investments, reasoning, and strategy changes. This keeps you objective and accountable.</List.Item>
                </List>
              </Stack>

              <Alert color="teal" variant="light" title="Words of Encouragement">
                <Text size="sm">
                  The journey to financial growth can be filled with challenges. Market swings are
                  unsettling, especially when you see the value of your portfolio decline. However,
                  these dips can be opportunities when viewed through the lens of disciplined
                  dollar-cost averaging and strategic doubling down. Stay patient, trust the process,
                  and remember — investing is a marathon, not a sprint.
                </Text>
              </Alert>

            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

      </Accordion>

      <Box mt="xl">
        <Alert color="gray" variant="outline" icon={<BsInfoCircle />}>
          <Text size="xs" c="dimmed">
            <strong>Disclaimer:</strong> The information provided in this guide is for educational
            purposes only and does not constitute financial advice. Investing involves risk, including
            possible loss of principal. Please consult a qualified financial advisor before making any
            investment decisions based on your personal circumstances. © Tom's DCA Strategy Tutorial.
            All rights reserved.
          </Text>
        </Alert>
      </Box>
    </Container>
  );
}
