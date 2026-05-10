import { OnboardingProvider } from '@/providers/onboarding-provider'
import OnboardingClient from './client'

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingClient />
    </OnboardingProvider>
  )
}
