import { motion } from "framer-motion";


export default function About() {

  return (

    <section 
      id="sobre" 
      className="about"
    >


      <motion.div

        className="about-content"

        initial={{
          opacity:0,
          y:40
        }}

        whileInView={{
          opacity:1,
          y:0
        }}

        transition={{
          duration:.7
        }}

      >


        <h2>

          Tecnologia,

          <br />

          design e inovação.

        </h2>



        <p>

          A Raster Digital cria experiências digitais
          para empresas que buscam presença online,
          performance e crescimento.

        </p>



        <p>

          Desenvolvemos sites modernos, sistemas
          personalizados e soluções digitais pensadas
          para transformar ideias em resultados.

        </p>



        <div className="about-stats">


          <div className="stat">

            <strong>
              100%
            </strong>

            <span>
              Foco em qualidade
            </span>

          </div>



          <div className="stat">

            <strong>
              Premium
            </strong>

            <span>
              Design moderno
            </span>

          </div>



          <div className="stat">

            <strong>
              Web
            </strong>

            <span>
              Tecnologia atual
            </span>

          </div>


        </div>



      </motion.div>





      <div className="about-cards">


        <motion.div

          className="about-card"

          whileHover={{
            y:-10
          }}

        >

          <h3>
            Design Premium
          </h3>

          <span>
            Interfaces modernas e experiências únicas.
          </span>

        </motion.div>





        <motion.div

          className="about-card"

          whileHover={{
            y:-10
          }}

        >

          <h3>
            Alta Performance
          </h3>

          <span>
            Projetos rápidos, seguros e escaláveis.
          </span>

        </motion.div>





        <motion.div

          className="about-card"

          whileHover={{
            y:-10
          }}

        >

          <h3>
            Tecnologia
          </h3>

          <span>
            Soluções criadas para o futuro.
          </span>

        </motion.div>


      </div>


    </section>

  );

}