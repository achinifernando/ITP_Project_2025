import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from "./components/Header";
import LorryTypesPage from "./components/LorryTypesPage";
import LorryDetails from "./components/LorryDetails"; // Component names should start with uppercase
import RequestForm from "./components/ServiceRequestForm";
import LorryCategoryCards from './components/LorryCategories';
import Footer from './components/Footer';
import Services from './components/Services';
import OrderForm from './components/OrderForm';
import Signup from './components/Signup';
import Login from './components/Login';
import ProfilePage from './components/ProfilePage';
import UpdateProfileForm from './components/UpdateProfileForm';
import HomePage from './components/HomePage';
import QuotationForm from './components/dashboard/QuotationGenerator'
import CompanyManagerDashbord from'./components/dashboard/CompanyManagerDashbord';
import ScheduleMeeting from './components/ClientBookingpage';
import CheckoutPage from './components/CheckoutPage';


function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
  {/* Default Home Page */}
  <Route path="/" element={<HomePage />} />

  {/* Home Page */}
  <Route path="/home" element={<HomePage />} />

  {/*Sign up form*/ }
  <Route path='/signup' element={<Signup />} />

  {/*Login form*/ }
  <Route path='/login' element={<Login />} />

  {/*Profile Page*/ }
  <Route path='/profilePage' element={<ProfilePage />} />

  {/*Profile form*/ }
  <Route path='/updateProfileForm/:clientId' element={<UpdateProfileForm />} />

  {/* product Page */}
  <Route path="/products" element={
    <>
      <LorryCategoryCards />
    </>
  } />

  {/* Lorry Types Page */}
  <Route path="/LorryTypesPage/:categoryId" element={<LorryTypesPage />} />

  {/* Lorry Details Page */}
  <Route path="/LorryDetails/:lorryId" element={<LorryDetails />} />

  {/*Request form*/ }
  <Route path='/requestform' element={<RequestForm />} />

  {/*Services page*/ }
  <Route path='/services' element={
    <>
    <Services />
    </>}/>

  {/*Order form*/ }
  <Route path='/orderform' element={<OrderForm />} />

  {/*quotation generator form*/ }
 <Route path='/quotationgeneratorform/:requestID' element={<QuotationForm />} /> 


  {/*dashboard page*/ }
  <Route path='/companyManagerDashbord' element={<CompanyManagerDashbord />} />


  {/*Client booking page*/ }
  <Route path='/schedule-meeting' element={<ScheduleMeeting />} />

  {/*Checkout page*/ }
  <Route path='/checkoutPage/:type/:id' element={<CheckoutPage />} />

</Routes>



         <Footer/>
      </div>
    </Router>
  );
}

export default App;

