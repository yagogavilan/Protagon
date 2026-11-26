import { AnimatePresence, motion } from 'motion/react';
import { useDemo } from '@/state/store';
import { LoginScreen } from '@/screens/LoginScreen';
import { CodeScreen } from '@/screens/CodeScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { AppShell } from './AppShell';

/** Roteamento por estado: login -> código -> onboarding -> app */
export function AuthFlow() {
  const auth = useDemo((s) => s.auth);
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={auth}
        className="absolute inset-0"
        initial={{ opacity: 0, x: auth === 'app' ? 0 : 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {auth === 'login' ? <LoginScreen /> : auth === 'code' ? <CodeScreen /> : auth === 'onboarding' ? <OnboardingScreen /> : <AppShell />}
      </motion.div>
    </AnimatePresence>
  );
}
