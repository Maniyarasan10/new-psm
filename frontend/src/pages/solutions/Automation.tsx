import { SOLUTIONS } from '../../lib/siteContent';
import { SolutionDetail } from './SolutionDetail';

const data = SOLUTIONS.find((s) => s.id === 'automation')!;

export default function Automation() {
  return <SolutionDetail solution={data} />;
}
