import { MotionConfig } from 'motion/react';
import { DeviceFrame } from '@/components/device/DeviceFrame';
import { DemoPanel } from '@/components/panel/DemoPanel';
import { AuthFlow } from '@/components/shell/AuthFlow';
import { useFitScale } from '@/lib/useFitScale';

export function App() {
  const scale = useFitScale(340 + 48);
  return (
    // reducedMotion="user": respeita prefers-reduced-motion em todas as animações do Motion
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-4 lg:flex-row lg:items-center lg:gap-12">
        <DeviceFrame scale={scale}>
          <AuthFlow />
        </DeviceFrame>
        <DemoPanel />
      </div>
    </MotionConfig>
  );
}
