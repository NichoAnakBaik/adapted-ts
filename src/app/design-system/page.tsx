import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function DesignSystemPreview() {
  return (
    <div className="min-h-screen p-8 bg-namsan-bg text-namsan-text">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Namsan Course Design System</h1>
          <p className="text-namsan-text-muted">Modern Korean Learning Platform UI Components</p>
        </div>

        {/* Colors Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-namsan-primary shadow-sm flex items-center justify-center font-bold">#ffc714</div>
              <p className="text-sm font-medium text-center">Primary Yellow</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-namsan-secondary shadow-sm flex items-center justify-center font-bold">#ffdd6f</div>
              <p className="text-sm font-medium text-center">Secondary Yellow</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-namsan-soft shadow-sm flex items-center justify-center font-bold">#ffe797</div>
              <p className="text-sm font-medium text-center">Soft Yellow</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-namsan-blue shadow-sm flex items-center justify-center text-white font-bold">#1f9fcf</div>
              <p className="text-sm font-medium text-center">Blue (Info/AI)</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-namsan-red shadow-sm flex items-center justify-center text-white font-bold">#dc2b31</div>
              <p className="text-sm font-medium text-center">Red (Error)</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-namsan-red-light shadow-sm flex items-center justify-center text-white font-bold">#f3593f</div>
              <p className="text-sm font-medium text-center">Red Light (Warning)</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-namsan-bg border shadow-sm flex items-center justify-center font-bold">#fefcf0</div>
              <p className="text-sm font-medium text-center">Background</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-namsan-bg-alt shadow-sm flex items-center justify-center font-bold">#dfdbd8</div>
              <p className="text-sm font-medium text-center">Background Alt</p>
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Buttons</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="danger">Danger Button</Button>
          </div>
          <div className="flex flex-wrap gap-4 items-center mt-4">
            <Button size="sm">Small Size</Button>
            <Button size="md">Medium Size</Button>
            <Button size="lg">Large Size</Button>
          </div>
        </section>

        {/* Badges Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Badges</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Badge variant="default">Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="info">AI Insight</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Error</Badge>
          </div>
        </section>

        {/* Progress Section */}
        <section className="max-w-md">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Progress Bar</h2>
          <div className="space-y-6">
            <ProgressBar progress={35} label="Korean Alphabet (Hangeul)" showValue />
            <ProgressBar progress={80} label="Basic Conversation" showValue />
            <ProgressBar progress={100} label="Speaking Test" showValue />
          </div>
        </section>

        {/* Cards Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Cards</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Standard Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-namsan-text-muted text-sm">
                  Used for generic content blocks, forms, and standard dashboard widgets.
                </p>
              </CardContent>
            </Card>

            <Card variant="highlight">
              <CardHeader>
                <CardTitle>Highlight Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-namsan-text-muted text-sm">
                  Used for important announcements, top achievements, or featured modules.
                </p>
                <Button variant="primary" size="sm" className="mt-4">Start Lesson</Button>
              </CardContent>
            </Card>

            <Card variant="blue">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>AI Analytics</CardTitle>
                  <Badge variant="info">Insight</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-namsan-text-muted text-sm">
                  Your speaking fluency improved by 15% this week. Focus more on listening exercises.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

      </div>
    </div>
  );
}
