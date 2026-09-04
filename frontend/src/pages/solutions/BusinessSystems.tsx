import { SOLUTIONS } from '../../lib/siteContent';
import { SolutionDetail } from './SolutionDetail';

const data = SOLUTIONS.find((s) => s.id === 'business-systems')!;

export default function BusinessSystems() {
  return <SolutionDetail solution={data} />;
}
