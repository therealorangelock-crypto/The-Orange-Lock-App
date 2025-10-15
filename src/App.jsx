import { useEffect } from 'react';
import { preventBlockedNavigation } from './utils/blocker';

function App() {
  useEffect(() => {
    document.addEventListener('click', preventBlockedNavigation);
    return () => {
      document.removeEventListener('click', preventBlockedNavigation);
    };
  }, []);

  return (
    <div className="App">
      {/* your existing onboarding / legal flow */}
      {/* your orange button stays as a visual element */}
    </div>
  );
}

export default App;