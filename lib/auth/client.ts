import { createAuthClient } from 'better-auth/react'
import {
  phoneNumberClient,
  inferAdditionalFields,
} from 'better-auth/client/plugins'
import type { auth } from './index'

export const authClient = createAuthClient({
  plugins: [phoneNumberClient(), inferAdditionalFields<typeof auth>()],
})
