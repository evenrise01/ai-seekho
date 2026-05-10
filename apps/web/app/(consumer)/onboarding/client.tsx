'use client'

import { useOnboarding } from '@/providers/onboarding-provider'
import { SplashScreen } from './screens/splash-screen'
import { IntroSlides } from './screens/intro-slides'
import { AuthScreen } from './screens/auth-screen'
import { GoalSelection } from './screens/goal-selection'
import { PersonaSelection } from './screens/persona-selection'
import { RoleSelection } from './screens/role-selection'
import { GenderSelection } from './screens/gender-selection'
import { AgeSelection } from './screens/age-selection'
import { PersonalizingScreen } from './screens/personalizing-screen'
import { OutcomeScreen } from './screens/outcome-screen'
import { PaywallScreen } from './screens/paywall-screen'
import { SuccessScreen } from './screens/success-screen'

export default function OnboardingClient() {
  const { step } = useOnboarding()

  switch (step) {
    case 0: return <SplashScreen />
    case 1: return <IntroSlides />
    case 2: return <AuthScreen />
    case 3: return <GoalSelection />
    case 4: return <PersonaSelection />
    case 5: return <RoleSelection />
    case 6: return <GenderSelection />
    case 7: return <AgeSelection />
    case 8: return <PersonalizingScreen />
    case 9: return <OutcomeScreen />
    case 10: return <PaywallScreen />
    case 11: return <SuccessScreen />
    default: return <SplashScreen />
  }
}
