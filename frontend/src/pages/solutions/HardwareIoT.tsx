import { SOLUTIONS } from '../../lib/siteContent';
import { SolutionDetail } from './SolutionDetail';

const data = SOLUTIONS.find((s) => s.id === 'hardware-iot')!;

export default function HardwareIoT() {
  return <SolutionDetail solution={data} />;
}
