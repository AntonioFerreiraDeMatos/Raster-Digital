import { motion } from "framer-motion";
import {
  Code2,
  Layout,
  Database,
  Sparkles
} from "lucide-react";


const services = [

  {
    icon:<Code2 size={30}/>,
    title:"Desenvolvimento de Sites",
    description:
      "Sites modernos, rápidos e profissionais criados para destacar sua marca."
  },


  {
    icon:<Database size={30}/>,
    title:"Sistemas Web",
    description:
      "Soluções personalizadas para automatizar processos e melhorar resultados."
  },


  {
    icon:<Layout size={30}/>,
    title:"Landing Pages",
    description:
      "Páginas de alta conversão focadas em apresentar e vender seus serviços."
  },


  {
    icon:<Sparkles size={30}/>,
    title:"Soluções Digitais",
    description:
      "Tecnologia sob medida para empresas que querem evoluir."
  }

];



export default function Services() {


  return (

    <section 
      id="servicos" 
      className="services"
    >


      <h2>
        Nossas soluções
      </h2>



      <div className="cards">


        {services.map((service,index)=>(


          <motion.div


            className="card service-card"


            key={index}


            initial={{
              opacity:0,
              y:40
            }}


            whileInView={{
              opacity:1,
              y:0
            }}


            transition={{
              duration:.5,
              delay:index * .1
            }}


          >


            <div className="service-icon">

              {service.icon}

            </div>



            <h3>

              {service.title}

            </h3>



            <p>

              {service.description}

            </p>



          </motion.div>


        ))}


      </div>


    </section>

  );

}