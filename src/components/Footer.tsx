import { FaLinkedin, FaGithub } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";

const Footer = () => {
  const shouldReduceMotion = useReducedMotion();

  const socialLinks = [
    { icon: FaLinkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/michal-guzy/" },
    { icon: FaGithub, label: "GitHub", href: "https://github.com/Gooozeee" },
  ];

  return (
    <div className="bg-[#09090B] border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.h3
          className="text-center text-white/80 text-lg font-medium mb-8 tracking-wide"
          style={{ fontFamily: "'Archivo', sans-serif" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Let's create together
        </motion.h3>

        <motion.footer
          className="flex justify-center gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {socialLinks.map((social, i) => (
            <motion.a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 text-white/60 hover:text-white transition-colors duration-300 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            >
              <social.icon size={20} />
              <span
                className="text-sm tracking-wide"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {social.label}
              </span>
            </motion.a>
          ))}
          <motion.button
            onClick={() => (window.location.href = "mailto:michalguzym@gmail.com")}
            className="group flex items-center gap-3 text-white/60 hover:text-white transition-colors duration-300 cursor-pointer bg-transparent border-none p-0"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          >
            <MdEmail size={20} />
            <span
              className="text-sm tracking-wide"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Email
            </span>
          </motion.button>
        </motion.footer>

        <motion.p
          className="text-center text-white/30 text-xs mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          © {new Date().getFullYear()} Michal Guzy. All rights reserved.
        </motion.p>
      </div>
    </div>
  );
};

export default Footer;