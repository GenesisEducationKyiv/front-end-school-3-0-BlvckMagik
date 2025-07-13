"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardContent, CardActions } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";

export default function MaterialDemoPage(): React.JSX.Element {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <main className="container mx-auto px-4 py-8 pb-[160px]">
      <h1 className="text-3xl font-bold mb-8 text-on-surface">
        Material 3 Components Demo
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-medium text-on-surface">Button Variants</h2>
            <p className="text-sm text-on-surface-variant">Різні варіанти кнопок Material 3</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button variant="filled">Filled</Button>
              <Button variant="outlined">Outlined</Button>
              <Button variant="text">Text</Button>
              <Button variant="elevated">Elevated</Button>
              <Button variant="tonal">Tonal</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="small">Small</Button>
              <Button size="medium">Medium</Button>
              <Button size="large">Large</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button disabled>Disabled</Button>
              <Button loading>Loading</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-medium text-on-surface">Input Components</h2>
            <p className="text-sm text-on-surface-variant">Різні варіанти полів вводу</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Email"
              placeholder="Enter your email"
              startIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              endIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              }
            />
            <Input
              label="Search"
              placeholder="Search..."
              variant="filled"
              startIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </CardContent>
        </Card>

        <Card variant="elevated" elevation="level-3">
          <CardHeader>
            <h2 className="text-xl font-medium text-on-surface">Contact Form</h2>
            <p className="text-sm text-on-surface-variant">Приклад форми з Material 3 компонентами</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                startIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />
              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                startIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />
              <Input
                label="Message"
                placeholder="Enter your message"
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                startIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                }
              />
            </form>
          </CardContent>
          <CardActions>
            <Button variant="text">Cancel</Button>
            <Button variant="filled" onClick={handleSubmit}>
              Submit
            </Button>
          </CardActions>
        </Card>

        <Card variant="outlined">
          <CardHeader>
            <h2 className="text-xl font-medium text-on-surface">Progress Components</h2>
            <p className="text-sm text-on-surface-variant">Різні варіанти прогрес-барів</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-on-surface-variant mb-2">Linear Progress</p>
              <div className="space-y-2">
                <Progress value={75} color="primary" />
                <Progress value={45} color="secondary" />
                <Progress value={90} color="error" />
              </div>
            </div>
            <div>
              <p className="text-sm text-on-surface-variant mb-2">Circular Progress</p>
              <div className="flex gap-4">
                <Progress variant="circular" value={60} size="small" />
                <Progress variant="circular" value={75} size="medium" />
                <Progress variant="circular" value={85} size="large" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-medium text-on-surface">Card Variants</h2>
            <p className="text-sm text-on-surface-variant">Різні варіанти карток</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Card variant="elevated" elevation="level-1" className="p-4">
                <p className="text-sm text-on-surface-variant">Elevated card with shadow</p>
              </Card>
              <Card variant="filled" className="p-4">
                <p className="text-sm text-on-surface-variant">Filled card with background</p>
              </Card>
              <Card variant="outlined" className="p-4">
                <p className="text-sm text-on-surface-variant">Outlined card with border</p>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 