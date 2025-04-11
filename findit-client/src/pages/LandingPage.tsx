// LandingPage.tsx
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className='pt-40'>
      <h1>Welcome to the App</h1>
      <Link to="/login">
        <button>Login</button>
      </Link>
      <Link to="/signup">
        <button>Signup</button>
      </Link>
    </div>
  );
};

export default LandingPage;
