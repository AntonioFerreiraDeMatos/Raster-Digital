import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  ArrowRight
} from "lucide-react";


export default function Navbar() {


  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("inicio");



  useEffect(() => {


    const handleScroll = () => {


      setScrolled(window.scrollY > 50);



      const sections = [
        "inicio",
        "sobre",
        "servicos",
        "tecnologias",
        "projetos",
        "contato"
      ];



      sections.forEach((section)=>{


        const element = document.getElementById(section);



        if(element){


          const top = element.offsetTop - 180;



          if(window.scrollY >= top){

            setActive(section);

          }


        }


      });


    };



    window.addEventListener(
      "scroll",
      handleScroll
    );



    return () => {

      window.removeEventListener(
        "scroll",
        handleScroll
      );

    };


  }, []);





  const links = [


    {
      name:"Início",
      href:"#inicio"
    },


    {
      name:"Sobre",
      href:"#sobre"
    },


    {
      name:"Serviços",
      href:"#servicos"
    },


    {
      name:"Tecnologias",
      href:"#tecnologias"
    },


    {
      name:"Projetos",
      href:"#projetos"
    },


    {
      name:"Contato",
      href:"#contato"
    }


  ];





  return (


    <motion.nav


      initial={{
        y:-100
      }}


      animate={{
        y:0
      }}


      transition={{
        duration:.7
      }}



      className={`navbar ${scrolled ? "scrolled" : ""}`}


    >




      <div className="logo">


        <img

          src="/logo.png"

          alt="Raster Digital"

        />


      </div>





      <div

        className={`menu ${open ? "open" : ""}`}

      >



        {

          links.map((link)=>(


            <a


              key={link.name}


              href={link.href}


              className={

                active === link.href.replace("#","")

                ?

                "active-link"

                :

                ""

              }


              onClick={()=>setOpen(false)}


            >


              {link.name}


            </a>


          ))

        }



      </div>





      <motion.a


        href="#contato"


        className="nav-button"



        whileHover={{

          scale:1.05

        }}



        whileTap={{

          scale:.95

        }}



      >

        Solicitar orçamento

        <ArrowRight size={18}/>


      </motion.a>





      <button


        className="menu-toggle"


        onClick={()=>setOpen(!open)}



      >


        {

          open

          ?

          <X size={28}/>

          :

          <Menu size={28}/>


        }



      </button>



    </motion.nav>


  );

}