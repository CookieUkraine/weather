import { Home, Login, NotFound, Products, Register} from "../common";

export default [
    {
        path: '/',
        element: <Home />
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/register',
        element: <Register />
    },
    {
        path: '/products',
        element: <Products />
    },
    {
        path: '/not-found',
        element: <NotFound />
    }

]