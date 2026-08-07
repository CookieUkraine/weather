import './App.css'
import Weather from "./pages/Weather/Weather";
function App() {
  return (
    <>
      {/* <Navigation />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/products" element={<Products />} />
      <Route path="/weather" element={<Weather />} />
      <Route path="/notFound" element={<NotFound />} />
    </Routes> */}
    <Weather />
    </>
  )
}

export default App