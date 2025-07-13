import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardContent, CardActions } from './Card';
import { Button } from './Button';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['elevated', 'filled', 'outlined'],
    },
    elevation: {
      control: { type: 'select' },
      options: ['level-0', 'level-1', 'level-2', 'level-3', 'level-4', 'level-5'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <h3 className="text-lg font-medium text-on-surface">Card Title</h3>
          <p className="text-sm text-on-surface-variant">Card subtitle</p>
        </CardHeader>
        <CardContent>
          <p className="text-on-surface">This is the card content. It can contain any text or components.</p>
        </CardContent>
        <CardActions>
          <Button variant="text">Cancel</Button>
          <Button>Action</Button>
        </CardActions>
      </>
    ),
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    elevation: 'level-2',
    children: (
      <>
        <CardHeader>
          <h3 className="text-lg font-medium text-on-surface">Elevated Card</h3>
        </CardHeader>
        <CardContent>
          <p className="text-on-surface">This card has elevation and shadow effects.</p>
        </CardContent>
        <CardActions>
          <Button>Learn More</Button>
        </CardActions>
      </>
    ),
  },
};

export const Filled: Story = {
  args: {
    variant: 'filled',
    children: (
      <>
        <CardHeader>
          <h3 className="text-lg font-medium text-on-surface">Filled Card</h3>
        </CardHeader>
        <CardContent>
          <p className="text-on-surface">This card has a filled background.</p>
        </CardContent>
        <CardActions>
          <Button variant="outlined">Cancel</Button>
          <Button variant="filled">Save</Button>
        </CardActions>
      </>
    ),
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: (
      <>
        <CardHeader>
          <h3 className="text-lg font-medium text-on-surface">Outlined Card</h3>
        </CardHeader>
        <CardContent>
          <p className="text-on-surface">This card has an outlined border.</p>
        </CardContent>
        <CardActions>
          <Button variant="text">Dismiss</Button>
        </CardActions>
      </>
    ),
  },
};

export const WithImage: Story = {
  args: {
    children: (
      <>
        <div className="relative">
          <img
            src="https://via.placeholder.com/400x200"
            alt="Card image"
            className="w-full h-48 object-cover rounded-t-xl"
          />
        </div>
        <CardHeader>
          <h3 className="text-lg font-medium text-on-surface">Card with Image</h3>
        </CardHeader>
        <CardContent>
          <p className="text-on-surface">This card includes an image at the top.</p>
        </CardContent>
        <CardActions>
          <Button variant="tonal">View Details</Button>
        </CardActions>
      </>
    ),
  },
};

export const HighElevation: Story = {
  args: {
    elevation: 'level-5',
    children: (
      <>
        <CardHeader>
          <h3 className="text-lg font-medium text-on-surface">High Elevation Card</h3>
        </CardHeader>
        <CardContent>
          <p className="text-on-surface">This card has maximum elevation and shadow.</p>
        </CardContent>
        <CardActions>
          <Button variant="elevated">Primary Action</Button>
        </CardActions>
      </>
    ),
  },
};

export const NoActions: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <h3 className="text-lg font-medium text-on-surface">Simple Card</h3>
        </CardHeader>
        <CardContent>
          <p className="text-on-surface">This card has no action buttons, just content.</p>
        </CardContent>
      </>
    ),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <Card variant="elevated" elevation="level-1">
        <CardHeader>
          <h3 className="text-lg font-medium text-on-surface">Elevated Card</h3>
          <p className="text-sm text-on-surface-variant">With shadow effect</p>
        </CardHeader>
        <CardContent>
          <p className="text-on-surface">This card has elevation and shadow effects.</p>
        </CardContent>
      </Card>
      
      <Card variant="filled">
        <CardHeader>
          <h3 className="text-lg font-medium text-on-surface">Filled Card</h3>
          <p className="text-sm text-on-surface-variant">With background color</p>
        </CardHeader>
        <CardContent>
          <p className="text-on-surface">This card has a filled background.</p>
        </CardContent>
      </Card>
      
      <Card variant="outlined">
        <CardHeader>
          <h3 className="text-lg font-medium text-on-surface">Outlined Card</h3>
          <p className="text-sm text-on-surface-variant">With border</p>
        </CardHeader>
        <CardContent>
          <p className="text-on-surface">This card has an outlined border.</p>
        </CardContent>
      </Card>
    </div>
  ),
}; 