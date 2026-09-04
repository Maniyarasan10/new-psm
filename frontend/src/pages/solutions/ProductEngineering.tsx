import { SOLUTIONS } from '../../lib/siteContent';
import { SolutionDetail } from './SolutionDetail';

const data = SOLUTIONS.find((s) => s.id === 'product-engineering')!;

export default function ProductEngineering() {
  return <SolutionDetail solution={data} />;
}
