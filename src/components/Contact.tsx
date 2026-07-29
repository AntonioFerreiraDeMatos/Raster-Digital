import { motion } from "framer-motion";
import { Mail, MessageCircle } from "lucide-react";


export default function Contact() {


  return (

    <section id="contato" className="contact">


      <motion.div

        className="contact-box"

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

          Vamos criar algo

          <br />

          extraordinário juntos.

        </h2>



        <p>

          Sua empresa merece uma presença digital
          moderna, rápida e profissional.

          A Raster Digital transforma ideias em
          experiências digitais de alto nível.

        </p>



        <div className="contact-actions">


          <a

            href="https://wa.me/5585992908430"

            target="_blank"

            rel="noreferrer"

            className="primary"

          >

            <MessageCircle size={20}/>

            Solicitar orçamento


          </a>



          <a

            href="mailto:contato@rasterdigital.com"

            className="outline"

          >

            <Mail size={20}/>

            Enviar e-mail


          </a>


        </div>




        <div className="contact-info">


          <div>

            <MessageCircle size={20}/>

            WhatsApp comercial

          </div>



          <div>

            <Mail size={20}/>

            contato@rasterdigital.com

          </div>


        </div>



      </motion.div>


    </section>

  );

}