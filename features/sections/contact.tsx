"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Save, ArrowRight } from "lucide-react";
import type { SocialLink } from "@/lib/types";
import { ContactForm } from "./contact-form";

export function ContactSection({ socials }: { socials: SocialLink[] }) {
  return (
    <section id="contact" className="py-24 px-4 md:px-8 bg-background relative overflow-hidden">
      
      {/* Decorative background grid */}
      <div className="absolute inset-0 world-map-grid opacity-50 pointer-events-none" />

      <div className="mx-auto max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-4 bg-primary text-primary-foreground rounded-full border-4 border-border shadow-[4px_4px_0px_hsl(var(--border))] mb-6">
            <Save className="w-8 h-8" />
          </div>
          <h2 className="font-bold text-4xl md:text-5xl text-foreground uppercase tracking-tight drop-shadow-sm">
            Main Menu
          </h2>
          <p className="mt-4 text-lg font-bold text-muted-foreground max-w-lg mx-auto">
            Ready to collaborate? Select an option below to connect.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Main Action Menu */}
          <motion.div
            className="rpg-panel bg-card p-6 flex flex-col gap-3"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="font-bold text-xl uppercase tracking-widest text-primary border-b-4 border-border/20 pb-3 mb-2 flex items-center gap-2">
              <ArrowRight className="w-5 h-5" /> Contact Options
            </h3>
            
            <a
              href="mailto:dhiptanshu@outlook.com"
              className="rpg-panel rpg-panel-interactive flex items-center gap-4 bg-background p-4 w-full group"
            >
              <div className="p-2 bg-primary text-primary-foreground rounded border-2 border-border group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Send Mail (Email)</span>
                <span className="font-bold text-foreground">dhiptanshu@outlook.com</span>
              </div>
            </a>


            <a 
              href="https://www.google.com/maps/place/Ahmedabad,+Gujarat,+India"
              target="_blank"
              rel="noopener noreferrer"
              className="rpg-panel rpg-panel-interactive flex items-center gap-4 bg-background p-4 w-full group"
            >
              <div className="p-2 bg-accent text-accent-foreground rounded border-2 border-border group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current Region</span>
                <span className="font-bold text-foreground">Ahmedabad, India</span>
              </div>
            </a>
          </motion.div>

          {/* Social Links Panel */}
          <motion.div
            className="flex flex-col justify-between"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {socials.length > 0 && (
              <div className="rpg-panel bg-card p-6 h-full flex flex-col">
                <h3 className="font-bold text-xl uppercase tracking-widest text-secondary border-b-4 border-border/20 pb-3 mb-6">
                  Social Links
                </h3>
                <div className="flex flex-col gap-3 flex-1">
                  {socials.map((social) => (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rpg-panel rpg-panel-interactive px-4 py-3 text-sm font-bold uppercase tracking-wider bg-background text-foreground text-center hover:bg-muted"
                    >
                      Connect on {social.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Contact Form CRM */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <ContactForm />
        </motion.div>

        {/* Footer mark */}
        <motion.div
          className="mt-16 pt-8 border-t-4 border-dashed border-border/20 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Version 1.0.0 · © {new Date().getFullYear()} Dhiptanshu Malik
          </p>
        </motion.div>
      </div>
    </section>
  );
}
