import { SOLUTIONS } from '../../lib/siteContent';
import { SolutionDetail } from './SolutionDetail';

const data = SOLUTIONS.find((s) => s.id === 'web-mobile')!;

export default function WebMobile() {
  return <SolutionDetail solution={data} />;
}
