import { FaLinkedin, FaGithub } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { motion, useReducedMotion } from "framer-motion";

const socialLinks = [
  { icon: FaLinkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/michal-guzy/" },
  { icon: FaGithub, label: "GitHub", href: "https://github.com/Gooozeee" },
];

const Footer = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <footer className="border-t border-white/10 bg-[#0B0B0C]">
      <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 md:grid-cols-[1.2fr_0.8fr] md:px-10 md:py-20">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">Prints and commissions</p>
          <motion.h2
            className="mt-4 max-w-2xl font-display text-[clamp(2rem,4.5vw,4rem)] leading-[0.95] tracking-[-0.04em] text-[#E9E2D6]"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            For prints, a shoot, or a question, email me.
          </motion.h2>
        </div>

        <div className="flex flex-col gap-3 self-end text-sm text-white/55 md:items-end">
          {socialLinks.map((social) => (
            <motion.a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-b border-white/10 pb-1 transition-colors duration-200 hover:border-white/40 hover:text-white"
              whileHover={shouldReduceMotion ? undefined : { x: 3 }}
              transition={{ duration: 0.2 }}
            >
              <social.icon size={14} />
              {social.label}
            </motion.a>
          ))}
          <motion.a
            href="mailto:michalguzym@gmail.com"
            className="inline-flex items-center gap-2 border-b border-white/10 pb-1 transition-colors duration-200 hover:border-white/40 hover:text-white"
            whileHover={shouldReduceMotion ? undefined : { x: 3 }}
            transition={{ duration: 0.2 }}
          >
            <MdEmail size={14} />
            michalguzym@gmail.com
          </motion.a>
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-5 md:px-10">
        <div className="mx-auto flex max-w-[1500px] flex-wrap justify-between gap-3 text-[10px] uppercase tracking-[0.25em] text-white/30">
          <span>© {new Date().getFullYear()} Michal Guzy</span>
          <span>De Goose Productions</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
