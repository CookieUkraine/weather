import { Link, Route, Routes } from "react-router-dom";
const Navigation = () => {
  return (
    <nav>
        <button>
          <Link to="/">Home</Link>
        </button>
        <button>
          <Link to="/login">Login</Link>
        </button>
        <button>
          <Link to="/Register">Register</Link>
        </button>
        <button>
          <Link to="/Products">Products</Link>
        </button>
        <button>
          <Link to="/NotFound">Not Found</Link>
        </button>
    </nav>
  );
};
export default Navigation;