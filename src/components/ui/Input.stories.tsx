import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    error: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...'
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    error: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'This input is disabled',
    disabled: true,
  },
};

export const WithValue: Story = {
  args: {
    label: 'Email',
    value: 'user@example.com',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <div className="space-y-4">
        <Input label="Default" placeholder="Enter text..." />
        <Input label="With Error" placeholder="Enter text..." error />
        <Input label="Disabled" placeholder="This is disabled" disabled />
        <Input label="With Value" value="user@example.com" />
      </div>
    </div>
  ),
}; 