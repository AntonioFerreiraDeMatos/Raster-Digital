import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Services from "./components/Services";
import Technologies from "./components/Technologies";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";


function App() {


  return (

    <div className="app">


      <Navbar />



      <main>


        <Hero />


        <About />


        <Services />


        <Technologies />


        <Projects />


        <Contact />


      </main>



      <Footer />


    </div>

  );

}


export default App;