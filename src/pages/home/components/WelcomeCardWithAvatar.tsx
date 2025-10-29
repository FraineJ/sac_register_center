import React from "react";
import { motion } from "framer-motion";
import { Sparkles, User, ArrowRight } from "lucide-react";

export type WelcomeCardProps = {
  /** Nombre de la persona usuaria: "Frainer" */
  name: string;
  /** Rol o subtítulo opcional: "Administrador" */
  subtitle?: string;
  /** URL del avatar (opcional). Si no se envía, se muestra un ícono */
  avatarUrl?: string;
  /** Texto del botón principal */
  primaryLabel?: string;
  /** Acción del botón principal */
  onPrimaryAction?: () => void;
  /** Texto del botón secundario */
  secondaryLabel?: string;
  /** Acción del botón secundario */
  onSecondaryAction?: () => void;
  /**
   * Mensaje extra (opcional). Por ejemplo: "Tienes 3 tareas para hoy".
   * Se renderiza debajo del subtítulo.
   */
  extraMessage?: string;
  /**
   * Permite reemplazar el saludo automático (según hora) por uno personalizado.
   */
  customGreeting?: string;
};

function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "Buenas noches"; // madrugada
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

/**
 * Componente de bienvenida elegante con animaciones.
 * Estilo: TailwindCSS + Framer Motion + Lucide Icons.
 *
 * Ejemplo de uso:
 * <WelcomeCard
 *   name="Frainer Simarra"
 *   subtitle="Administrador"
 *   avatarUrl="https://i.pravatar.cc/150?img=3"
 *   primaryLabel="Ir al panel"
 *   onPrimaryAction={() => router.push('/dashboard')}
 *   secondaryLabel="Editar perfil"
 *   onSecondaryAction={() => setOpenProfile(true)}
 *   extraMessage="Tienes 3 notificaciones nuevas"
 * />
 */
const WelcomeCard: React.FC<WelcomeCardProps> = ({
  name,
  subtitle,
  avatarUrl,
  primaryLabel = "Comenzar",
  onPrimaryAction,
  secondaryLabel = "Editar perfil",
  onSecondaryAction,
  extraMessage,
  customGreeting,
}) => {
  const greeting = customGreeting ?? getTimeGreeting();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 shadow-xl border border-white/10"
      role="region"
      aria-label={`Tarjeta de bienvenida para ${name}`}
    >
      {/* Brillos decorativos */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="flex items-start gap-4 sm:gap-6">
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.05 }}
          className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-2xl bg-white/5 ring-1 ring-white/10 grid place-items-center"
          aria-hidden
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="h-full w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="grid place-items-center">
              <span className="mt-1 text-4xl font-bold text-white">
                {initialsFromName(name)}
              </span>
            </div>
          )}
        </motion.div>

        {/* Texto */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Sparkles className="h-4 w-4" aria-hidden />
            <span className="truncate">{greeting}</span>
          </div>

          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            ¡Bienvenido, <span className="text-cyan-300">{name}</span>!
          </h1>

          <p className="mt-4 text-gray-200">
            Estamos encantados de tenerte aquí. Esperamos que tengas una excelente experiencia.
          </p>

          {subtitle && (
            <p className="mt-1 text-white/70 text-sm sm:text-base">{subtitle}</p>
          )}

          {extraMessage && (
            <p className="mt-3 text-white/80 text-sm sm:text-base">{extraMessage}</p>
          )}

          {/* Botones */}
          {/* <div className="mt-5 flex flex-wrap gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ y: -1 }}
              onClick={onPrimaryAction}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500/90 px-4 py-2 text-slate-900 font-semibold shadow-lg hover:bg-cyan-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              {primaryLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </motion.button>

            <button
              onClick={onSecondaryAction}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-white font-medium ring-1 ring-white/15 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              <User className="h-4 w-4" aria-hidden />
              {secondaryLabel}
            </button>
          </div> */}
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeCard;