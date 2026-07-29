import { motion } from "framer-motion";
import {
  Atom,
  Code2,
  Server,
  Database,
  Cloud,
  Palette
} from "lucide-react";


const technologies = [

  {
    icon: Atom,
    title:"React",
    description:
    "Interfaces modernas, rápidas e experiências digitais de alto nível."
  },

  {
    icon: Code2,
    title:"TypeScript",
    description:
    "Código seguro, organizado e preparado para projetos escaláveis."
  },

  {
    icon: Server,
    title:"Node.js",
    description:
    "Backends eficientes para sistemas e aplicações personalizadas."
  },

  {
    icon: Database,
    title:"Banco de Dados",
    description:
    "Arquiteturas organizadas para segurança e performance dos dados."
  },

  {
    icon: Cloud,
    title:"Cloud",
    description:
    "Aplicações preparadas para disponibilidade e crescimento."
  },

  {
    icon: Palette,
    title:"UI/UX Design",
    description:
    "Interfaces bonitas, intuitivas e focadas na experiência do usuário."
  }

];



export default function Technologies(){


  return (

    <section id="tecnologias" className="technologies">


      <motion.div

        initial={{
          opacity:0,
          y:40
        }}

        whileInView={{
          opacity:1,
          y:0
        }}

        viewport={{
          once:true
        }}

      >

        <span className="hero-badge">

          Nossa tecnologia

        </span>


        <h2>

          Ferramentas modernas
          <br/>
          para criar o futuro.

        </h2>


      </motion.div>



      <div className="tech-grid">


        {
          technologies.map((tech,index)=>{


            const Icon = tech.icon;


            return (

              <motion.div

                className="tech-card"

                key={index}


                initial={{
                  opacity:0,
                  y:40
                }}


                whileInView={{
                  opacity:1,
                  y:0
                }}


                viewport={{
                  once:true
                }}


                transition={{
                  delay:index*.12
                }}


                whileHover={{
                  y:-10,
                  scale:1.03
                }}

              >


                <div className="tech-icon">

                  <Icon size={30}/>

                </div>



                <h3>

                  {tech.title}

                </h3>



                <p>

                  {tech.description}

                </p>



              </motion.div>

            );


          })
        }


      </div>


    </section>

  );

}