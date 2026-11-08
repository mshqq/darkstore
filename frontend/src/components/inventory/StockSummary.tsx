import { Card, Col, Row, Statistic } from 'antd';

type StockSummaryProps = {
  positions: number;
  low: number;
  available: number;
};

const StockSummary = ({ positions, low, available }: StockSummaryProps) => {
  return (
    <Row gutter={[16, 16]}>
      <Col
        xs={24}
        sm={8}
      >
        <Card size="small">
          <Statistic
            title="Позиций в списке"
            value={positions}
          />
        </Card>
      </Col>
      <Col
        xs={24}
        sm={8}
      >
        <Card size="small">
          <Statistic
            title="Заканчиваются"
            value={low}
            styles={{ content: low > 0 ? { color: '#cf1322' } : undefined }}
          />
        </Card>
      </Col>
      <Col
        xs={24}
        sm={8}
      >
        <Card size="small">
          <Statistic
            title="Единиц доступно"
            value={available}
            groupSeparator=" "
          />
        </Card>
      </Col>
    </Row>
  );
};

export default StockSummary;
