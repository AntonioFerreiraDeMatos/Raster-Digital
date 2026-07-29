import { motion } from "framer-motion";
import { ArrowRight, Code2, Sparkles } from "lucide-react";


export default function Hero() {


  return (

    <section 
      id="inicio" 
      className="hero"
    >


      <div className="hero-glow"></div>



      <div className="hero-grid">



        <div className="hero-left">



          <motion.div

            className="hero-badge"

            initial={{
              opacity:0,
              y:20
            }}

            animate={{
              opacity:1,
              y:0
            }}

            transition={{
              duration:.6
            }}

          >

            <Sparkles size={16}/>

            Tecnologia • Design • Performance


          </motion.div>





          <motion.h1

            initial={{
              opacity:0,
              y:40
            }}

            animate={{
              opacity:1,
              y:0
            }}

            transition={{
              duration:.8
            }}

          >

            Criamos experiências digitais

            <span>

              que transformam negócios.

            </span>


          </motion.h1>





          <motion.p

            initial={{
              opacity:0,
              y:30
            }}

            animate={{
              opacity:1,
              y:0
            }}

            transition={{
              duration:.8,
              delay:.2
            }}

          >

            A Raster Digital desenvolve sites,
            sistemas e soluções digitais modernas
            para empresas que querem crescer,
            vender mais e construir uma presença
            online profissional.

          </motion.p>






          <motion.div

            className="buttons"

            initial={{
              opacity:0,
              y:20
            }}

            animate={{
              opacity:1,
              y:0
            }}

            transition={{
              duration:.8,
              delay:.4
            }}

          >



            <motion.a

              href="https://wa.me/5585992908430"

              target="_blank"

              rel="noreferrer"

              className="primary"

              whileHover={{
                scale:1.05
              }}

            >

              Solicitar orçamento

              <ArrowRight size={18}/>


            </motion.a>






            <motion.a

              href="#projetos"

              className="outline"

              whileHover={{
                scale:1.05
              }}

            >

              Ver projetos


            </motion.a>




          </motion.div>



        </div>






        <motion.div

          className="hero-right"

          initial={{
            opacity:0,
            scale:.8
          }}

          animate={{
            opacity:1,
            scale:1
          }}

          transition={{
            duration:1
          }}

        >




          <motion.div

            className="hero-panel"

            animate={{

              y:[0,-12,0]

            }}

            transition={{

              duration:5,

              repeat:Infinity

            }}

          >



            <div className="panel-header">


              <span></span>

              <span></span>

              <span></span>


            </div>





            <div className="panel-content">


              <Code2 size={35}/>



              <div className="code-line long"></div>

              <div className="code-line medium"></div>

              <div className="code-line short"></div>





              <div className="dashboard-card">


                <div></div>

                <div></div>

                <div></div>


              </div>





              <div className="code-line medium"></div>

              <div className="code-line long"></div>



            </div>



          </motion.div>




        </motion.div>




      </div>



    </section>

  );

}