import type { Preview } from '@storybook/nextjs-vite'
import { NextIntlClientProvider } from 'next-intl'
import React from 'react'

import '../app/globals.css'
import { ThemeProvider } from '../components/theme-provider'

import enMessages from '../messages/en.json'
import bnMessages from '../messages/bn.json'

const messagesMap = {
  en: enMessages,
  bn: bnMessages,
} as const

type Locale = keyof typeof messagesMap

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      test: 'todo',
    },
    backgrounds: {
      options: {
        light: { name: 'light', value: '#fafafa' },
        dark: { name: 'dark', value: '#000000' },
      },
    },
    viewport: {
      options: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' } },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1280px', height: '800px' },
        },
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      description: 'Internationalization locale',
      defaultValue: 'en',
      toolbar: {
        title: 'Locale',
        icon: 'globe',
        items: [
          { value: 'en', title: 'English' },
          { value: 'bn', title: 'বাংলা' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = (context.globals.theme as string) || 'light'
      const locale = (context.globals.locale as Locale) || 'en'
      const messages = messagesMap[locale] ?? messagesMap.en

      React.useEffect(() => {
        const root = document.documentElement
        if (theme === 'dark') {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }, [theme])

      return (
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
          timeZone="Asia/Dhaka"
        >
          <ThemeProvider>
            <div
              className={theme === 'dark' ? 'dark' : ''}
              style={{
                background: theme === 'dark' ? '#000000' : '#fafafa',
                minHeight: '100vh',
              }}
            >
              <Story />
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      )
    },
  ],
  tags: ['autodocs'],
}

export default preview
