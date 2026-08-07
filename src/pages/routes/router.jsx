import { RouterProvider } from "react-router-dom";
import commonRouter from "./common.router";

const MyAppRouter = () => <RouterProvider router={createBrowserRouter(commonRouter)}/>

export default MyAppRouter;