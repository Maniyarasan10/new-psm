import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/home/Home';
import ProductsPage from './pages/products/Products';
import Boowa from './pages/products/Boowa';
import EYD from './pages/products/EYD';
import Aura from './pages/products/Aura';
import SolutionsPage from './pages/solutions/Solutions';
import AI from './pages/solutions/AI';
import BusinessSystems from './pages/solutions/BusinessSystems';
import Automation from './pages/solutions/Automation';
import WebMobile from './pages/solutions/WebMobile';
import ProductEngineering from './pages/solutions/ProductEngineering';
import HardwareIoT from './pages/solutions/HardwareIoT';
import Industries from './pages/Industries';
import CaseStudies from './pages/CaseStudies';
import About from './pages/About';
import Careers from './pages/Careers';
import Contact from './pages/Contact';
import Partner from './pages/Partner';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/boowa" element={<Boowa />} />
        <Route path="/products/eyd" element={<EYD />} />
        <Route path="/products/aura" element={<Aura />} />
        <Route path="/solutions" element={<SolutionsPage />} />
        <Route path="/solutions/ai" element={<AI />} />
        <Route path="/solutions/business-systems" element={<BusinessSystems />} />
        <Route path="/solutions/automation" element={<Automation />} />
        <Route path="/solutions/web-mobile" element={<WebMobile />} />
        <Route path="/solutions/product-engineering" element={<ProductEngineering />} />
        <Route path="/solutions/hardware-iot" element={<HardwareIoT />} />
        <Route path="/industries" element={<Industries />} />
        <Route path="/case-studies" element={<CaseStudies />} />
        <Route path="/about" element={<About />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/partner" element={<Partner />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
