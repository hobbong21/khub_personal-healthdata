import React from 'react';
import { Button } from '../Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../Card';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';

/**
 * Example component demonstrating the usage of common UI components
 * This file is for reference and testing purposes
 */
export const ComponentExamples: React.FC = () => {
  const [loading, setLoading] = React.useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Common UI Components Examples</h1>

      {/* Button Examples */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>Buttons</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="success">Success</Button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <Button size="small">Small</Button>
          <Button size="medium">Medium</Button>
          <Button size="large">Large</Button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <Button icon={<span>🚀</span>}>With Icon</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>

        <Button fullWidth onClick={handleClick}>
          Full Width Button
        </Button>
      </section>

      {/* Card Examples */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>Cards</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <Card variant="default">
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This is a default card with standard styling.</p>
            </CardContent>
            <CardFooter>
              <Button size="small">Action</Button>
            </CardFooter>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This card has an elevated shadow effect.</p>
            </CardContent>
            <CardFooter>
              <Button size="small" variant="secondary">Learn More</Button>
            </CardFooter>
          </Card>

          <Card variant="outlined" hoverable>
            <CardHeader>
              <CardTitle>Hoverable Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Hover over this card to see the effect.</p>
            </CardContent>
            <CardFooter>
              <Button size="small" variant="outline">Explore</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Loading Spinner Examples */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>Loading Spinners</h2>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <p>Small</p>
            <LoadingSpinner size="small" text="" />
          </div>
          <div>
            <p>Medium</p>
            <LoadingSpinner size="medium" text="" />
          </div>
          <div>
            <p>Large</p>
            <LoadingSpinner size="large" text="" />
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <LoadingSpinner text="데이터를 불러오는 중..." />
        </div>

        <div style={{ marginTop: '2rem' }}>
          <Button onClick={() => setLoading(!loading)}>
            Toggle Full Screen Loading
          </Button>
          {loading && <LoadingSpinner fullScreen />}
        </div>
      </section>

      {/* Combined Example */}
      <section>
        <h2>Combined Example</h2>
        <Card variant="elevated" padding="large">
          <CardHeader>
            <CardTitle>건강 데이터 업로드</CardTitle>
          </CardHeader>
          <CardContent>
            <p style={{ marginBottom: '1rem' }}>
              건강 데이터를 업로드하여 AI 기반 분석을 받아보세요.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Button icon={<span>📁</span>} variant="primary">
                파일 선택
              </Button>
              <Button icon={<span>📊</span>} variant="secondary">
                샘플 보기
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="success" fullWidth>
              분석 시작
            </Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
};
