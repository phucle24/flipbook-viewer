import { Outlet } from 'react-router-dom';
import FlipbookLayout from './components/FlipbookLayout';

function App() {
  return (
    <FlipbookLayout>
      <Outlet />
    </FlipbookLayout>
  );
}

export default App;
