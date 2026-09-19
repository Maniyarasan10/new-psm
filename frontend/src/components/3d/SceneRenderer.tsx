import { ContactOrb } from './objects/ContactOrb';
import type { SceneVariant } from './sceneRegistry';
import { HomeHeroScene } from './HomeHeroScene';
import { PSBusinessStack } from './library/PSBusinessStack';
import { PSDeviceMesh } from './library/PSDeviceMesh';
import { PSIoTNetwork } from './library/PSIoTNetwork';
import { PSProductAssembly } from './library/PSProductAssembly';
import { PSWorkflowEngine } from './library/PSWorkflowEngine';
import { PSMMorphingParticles } from './library/PSMMorphingParticles';

export interface SceneRendererProps {
  variant: SceneVariant;
}

export default function SceneRenderer({ variant }: SceneRendererProps) {
  switch (variant) {
    case 'home-hero':
      return <HomeHeroScene />;
    case 'products-hub':
      return <PSMMorphingParticles variant="products-hub" seed={1} radius={3.5} speed={0.02} morphDuration={3} morphInterval={15000} />;
    case 'boowa':
      return <PSMMorphingParticles variant="boowa" seed={12} radius={3.2} speed={0.025} morphDuration={2.5} morphInterval={12000} />;
    case 'eyd':
      return <PSMMorphingParticles variant="eyd" seed={7} radius={3.4} speed={0.02} morphDuration={3} morphInterval={14000} />;
    case 'aura':
      return <PSMMorphingParticles variant="aura" seed={9} radius={3} speed={0.025} morphDuration={2.5} morphInterval={12000} />;
    case 'solutions-hub':
      return <PSMMorphingParticles variant="solutions-hub" seed={5} radius={3.8} speed={0.018} morphDuration={3.5} morphInterval={16000} />;
    case 'ai':
      return <PSMMorphingParticles variant="ai" seed={1} radius={3.5} speed={0.025} morphDuration={2.5} morphInterval={10000} />;
    case 'business-systems':
      return <PSBusinessStack
        seed={2}
        accent="#0d6efd"
        accent2="#15846e"
        layers={3}
        gridSize={3}
        spacing={0.6}
        cellSize={0.25}
        wireOpacity={0.25}
        pulseCount={2}
        pulseSpeed={0.12}
      />;
    case 'automation':
      return <PSWorkflowEngine
        seed={3}
        accent="#06b6d4"
        accent2="#ffb829"
        accent3="#15846e"
        tubeRadius={0.03}
        particleCount={6}
        particleSpeed={0.14}
        interactive={true}
      />;
    case 'web-mobile':
      return <PSDeviceMesh
        seed={4}
        accent="#15846e"
        accent2="#0d6efd"
        deviceCount={6}
        gridCols={3}
        spacing={1.3}
        deviceWidth={0.42}
        deviceHeight={0.68}
        deviceDepth={0.05}
        screenOpacity={0.5}
      />;
    case 'product-engineering':
      return <PSProductAssembly
        seed={5}
        accent="#ffb829"
        accent2="#0d6efd"
        accent3="#8b5cf6"
        scrollId="product-engineering"
        stageSpacing={1.6}
        baseScale={0.88}
        particleCount={30}
      />;
    case 'hardware-iot':
      return <PSIoTNetwork
        seed={6}
        accent="#06b6d4"
        accent2="#ffb829"
        sensorCount={8}
        gatewayCount={2}
        radius={2.4}
        connectionRadius={1.7}
        pulseCount={3}
        pulseSpeed={0.18}
      />;
    case 'about':
      return <PSMMorphingParticles variant="about" seed={6} radius={4} speed={0.015} morphDuration={4} morphInterval={20000} />;
    case 'contact':
      return <ContactOrb accent="#0d6efd" accent2="#ffb829" />;
    default:
      return <PSMMorphingParticles variant="default" seed={42} radius={3.5} speed={0.02} morphDuration={3} morphInterval={15000} />;
  }
}