import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

import type { PointerEvent } from "react";

import {
  ArrowRight,
  Play,
  Sparkles,
} from "lucide-react";

export default function Hero() {
  // ==========================================
  // PARALLAX DO MOUSE
  // ==========================================

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const smoothX = useSpring(pointerX, {
    stiffness: 80,
    damping: 20,
  });

  const smoothY = useSpring(pointerY, {
    stiffness: 80,
    damping: 20,
  });

  const deviceX = useTransform(
    smoothX,
    [-1, 1],
    [-18, 18]
  );

  const deviceY = useTransform(
    smoothY,
    [-1, 1],
    [-12, 12]
  );

  // ==========================================
  // MOVIMENTO DO MOUSE
  // ==========================================

  const handlePointerMove = (
    event: PointerEvent<HTMLElement>
  ) => {
    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      ((event.clientX - rect.left) / rect.width) * 2 - 1;

    const y =
      ((event.clientY - rect.top) / rect.height) * 2 - 1;

    pointerX.set(x);
    pointerY.set(y);
  };

  // ==========================================
  // RESET DO PARALLAX
  // ==========================================

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <section
      id="inicio"
      className="hero"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
    >
      {/* ======================================
          EFEITOS DE FUNDO
      ======================================= */}

      <div className="hero-noise" />

      <div className="hero-orbit orbit-one" />

      <div className="hero-orbit orbit-two" />

      {/* ======================================
          GRID PRINCIPAL
      ======================================= */}

      <div className="hero-grid section-shell">

        {/* ====================================
            SCANLINE
        ===================================== */}

        <motion.div
          className="hero-scanline"
          animate={{
            x: ["-120%", "120%"],
            opacity: [0, 0.45, 0],
          }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* ====================================
            CONTEÚDO
        ===================================== */}

        <motion.div
          className="hero-copy"
          initial={{
            opacity: 0,
            x: -45,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.9,
            ease: "easeOut",
          }}
        >
          {/* BADGE */}

          <motion.div
            className="hero-pill"
            initial={{
              opacity: 0,
              y: -12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.15,
              duration: 0.55,
            }}
          >
            <Sparkles size={14} />

            <span>TECNOLOGIA</span>

            <span>•</span>

            <span>DESIGN</span>

            <span>•</span>

            <span>RESULTADOS</span>
          </motion.div>

          {/* TÍTULO */}

          <motion.h1
            initial={{
              opacity: 0,
              y: 22,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.28,
              duration: 0.7,
            }}
          >
            CONECTANDO
            <br />

            <span>IDEIAS</span>

            <br />

            E RESULTADOS
          </motion.h1>

          {/* DESCRIÇÃO */}

          <motion.p
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.42,
              duration: 0.65,
            }}
          >
            Transformamos ideias em experiências digitais
            que geram valor, presença e crescimento real
            para o seu negócio.
          </motion.p>

          {/* ==================================
              BOTÕES
          =================================== */}

          <motion.div
            className="hero-actions"
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.55,
              duration: 0.6,
            }}
          >
            <a
              className="primary"
              href="#contato"
            >
              Falar com especialista

              <ArrowRight size={16} />
            </a>

            <a
              className="play-link"
              href="#sobre"
            >
              <span>
                <Play
                  size={15}
                  fill="currentColor"
                />
              </span>

              <div>
                Ver como
                <br />
                trabalhamos
              </div>
            </a>
          </motion.div>

          {/* ==================================
              ESTATÍSTICAS
          =================================== */}

          <motion.div
            className="hero-stats"
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.68,
              duration: 0.6,
            }}
          >
            <div>
              <strong>+20</strong>

              <small>
                Projetos entregues
              </small>
            </div>

            <div>
              <strong>100%</strong>

              <small>
                Foco em resultados
              </small>
            </div>

            <div>
              <strong>24/7</strong>

              <small>
                Suporte especializado
              </small>
            </div>
          </motion.div>
        </motion.div>

        {/* ======================================
            DISPOSITIVOS
        ======================================= */}

        <motion.div
          className="device-stage"
          initial={{
            opacity: 0,
            scale: 0.94,
            y: 25,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          transition={{
            duration: 1.05,
            delay: 0.12,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            x: deviceX,
            y: deviceY,
          }}
        >
          {/* GLOW */}

          <motion.div
            className="reference-device-glow"
            animate={{
              opacity: [0.45, 0.8, 0.45],
              scale: [0.98, 1.03, 0.98],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* IMAGEM */}

          <motion.img
            className="reference-device-image"
            src="/hero-reference-devices.jpg"
            alt="Ecossistema digital Raster Digital em notebook, tablet e smartphone"
            animate={{
              y: [-5, 5, -5],
              rotateZ: [-0.25, 0.25, -0.25],
            }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

      </div>
    </section>
  );
}