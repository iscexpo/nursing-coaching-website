import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FormField } from './form-field'

const meta: Meta<typeof FormField> = {
  title: 'Design System/FormField',
  component: FormField,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Wraps label + input + error + helpText from `components/ui/form-field.tsx:12`. Used by every admin form.',
      },
    },
  },
  argTypes: {
    required: { control: 'boolean' },
    label: { control: 'text' },
    error: { control: 'text' },
    helpText: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof FormField>

const InputStub = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    placeholder="Type here..."
    {...props}
  />
)

export const Default: Story = {
  args: {
    label: 'Email Address',
    children: <InputStub type="email" placeholder="you@example.com" />,
  },
}

export const Required: Story = {
  args: {
    label: 'Phone number',
    required: true,
    children: <InputStub placeholder="+8801..." />,
  },
}

export const WithError: Story = {
  args: {
    label: 'Course fee',
    error: 'Fee is required and must be greater than 0',
    required: true,
    children: <InputStub placeholder="5000" />,
  },
}

export const WithHelpText: Story = {
  args: {
    label: 'Course code',
    helpText: 'e.g. NAC-2025, unique identifier.',
    children: <InputStub placeholder="NAC-2025" />,
  },
}

export const HelpTextHiddenWhenError: Story = {
  args: {
    label: 'Password',
    error: 'Password must be at least 6 characters',
    helpText: 'This help text should be hidden when error exists.',
    children: <InputStub type="password" />,
  },
}

export const NoLabel: Story = {
  args: {
    helpText: 'Without label — just input + help.',
    children: <InputStub placeholder="No label" />,
  },
}

export const FormExample: Story = {
  render: () => (
    <div className="grid max-w-md gap-4">
      <FormField label="Full name" required>
        <InputStub placeholder="Ahmed Hassan" />
      </FormField>
      <FormField
        label="Email"
        helpText="We'll never share your email."
        required
      >
        <InputStub type="email" placeholder="ahmed@example.com" />
      </FormField>
      <FormField label="Phone" error="Invalid phone format">
        <InputStub placeholder="01XXXXXXXXX" defaultValue="abc" />
      </FormField>
    </div>
  ),
}
