import { motion } from "framer-motion";


const projects = [

  {
    title: "JS Retífica",
    category: "Site Institucional",
    description:
      "Site profissional desenvolvido para uma empresa real, com foco em apresentação de serviços, credibilidade online e facilidade de contato com clientes.",
    link: "https://www.jsretifica.com.br/"
  },


  {
    title: "Soluções Digitais",
    category: "Projetos em desenvolvimento",
    description:
      "Criação de sites, sistemas web e plataformas digitais personalizadas para empresas que buscam crescimento."
  },


  {
    title: "Novos Projetos",
    category: "Em breve",
    description:
      "A Raster Digital está desenvolvendo novas experiências digitais modernas, rápidas e escaláveis."
  }

];



export default function Projects() {


  return (

    <section id="projetos" className="projects">


      <h2>
        Projetos selecionados
      </h2>



      <div className="projects-grid">


        {projects.map((project,index)=>(


          <motion.div

            className="project-card"

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
              delay:index * .15
            }}

          >



            <span>
              {project.category}
            </span>



            <h3>
              {project.title}
            </h3>



            <p>
              {project.description}
            </p>



            {
              project.link && (

                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-button"
                >

                  Ver projeto

                </a>

              )
            }



          </motion.div>


        ))}


      </div>


    </section>

  );

}