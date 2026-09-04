import { SOLUTIONS } from '../../lib/siteContent';
import { SolutionDetail } from './SolutionDetail';

const data = SOLUTIONS.find((s) => s.id === 'ai')!;

export default function AI() {
  return <SolutionDetail solution={data} />;
}
