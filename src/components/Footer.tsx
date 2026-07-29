import { Mail, MapPin, MessageCircle } from "lucide-react";


export default function Footer() {


  return (

    <footer className="footer">


      <div className="footer-grid">


        <div className="footer-brand">


          <h3>

            RASTER<span>DIGITAL</span>

          </h3>


          <p>

            Criando experiências digitais modernas,
            rápidas e profissionais para empresas
            que querem crescer no mundo digital.

          </p>


        </div>




        <div className="footer-column">


          <h4>

            Navegação

          </h4>


          <a href="#inicio">

            Início

          </a>


          <a href="#sobre">

            Sobre

          </a>


          <a href="#servicos">

            Serviços

          </a>


          <a href="#projetos">

            Projetos

          </a>


        </div>





        <div className="footer-column">


          <h4>

            Serviços

          </h4>


          <a href="#">

            Sites profissionais

          </a>


          <a href="#">

            Sistemas Web

          </a>


          <a href="#">

            Landing Pages

          </a>


          <a href="#">

            Soluções Digitais

          </a>


        </div>





        <div className="footer-column">


          <h4>

            Contato

          </h4>



          <p>

            <MessageCircle size={18}/>

            WhatsApp

          </p>



          <p>

            <Mail size={18}/>

            contato@rasterdigital.com

          </p>



          <p>

            <MapPin size={18}/>

            Brasil

          </p>



        </div>



      </div>





      <div className="copyright">


        <span>

          © 2026 Raster Digital. Todos os direitos reservados.

        </span>


        <span>

          Tecnologia • Design • Performance

        </span>


      </div>



    </footer>

  );

}